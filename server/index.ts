import express from 'express'
import helmet from 'helmet'
import { db, tx } from './db'
import { detectSignals } from '../src/engine/signals'
import { rankActions } from '../src/engine/rules'
import type { Context, Location, Persona, Transport } from '../src/engine/types'

const LOCATIONS: Location[] = ['home', 'work', 'station', 'busstop', 'abroad', 'shop', 'city']
const TRANSPORTS: Transport[] = ['walk', 'car', 'train', 'bus']

const PORT = Number(process.env.PORT ?? 3001)
const app = express()
app.use(helmet())
app.use(express.json())

const getPersona = (id: string): Persona | undefined => {
  const row = db.prepare('SELECT data FROM customers WHERE id = ?').get(id) as { data: string } | undefined
  return row && JSON.parse(row.data)
}

// Each past click on an action is worth +5 for this customer (capped in the engine).
const feedbackFor = (customerId: string): Record<string, number> => {
  const rows = db.prepare(
    `SELECT action_id, COUNT(*) AS clicks FROM interactions WHERE customer_id = ? AND kind = 'click' GROUP BY action_id`,
  ).all(customerId) as { action_id: string; clicks: number }[]
  return Object.fromEntries(rows.map(r => [r.action_id, r.clicks * 5]))
}

app.get('/api/customers', (_req, res) => {
  const rows = db.prepare('SELECT data FROM customers ORDER BY rowid').all() as { data: string }[]
  res.json(rows.map(r => JSON.parse(r.data)))
})

app.post('/api/customers/:id/context', (req, res) => {
  const persona = getPersona(req.params.id)
  if (!persona) return res.status(404).json({ error: 'Unknown customer' })

  const { hour, location, transport } = req.body ?? {}
  if (typeof hour !== 'number' || !LOCATIONS.includes(location) || ![...TRANSPORTS, null, undefined].includes(transport))
    return res.status(400).json({ error: `Expected { hour: number, location: ${LOCATIONS.join('|')}, transport?: ${TRANSPORTS.join('|')}|null }` })
  const ctx: Context = { hour, location, transport: transport ?? null }

  const signals = detectSignals(persona, ctx)
  const ranked = rankActions(signals, ctx, feedbackFor(persona.id))

  const eventId = tx(() => {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO context_events (customer_id, hour, location, transport) VALUES (?, ?, ?, ?)')
      .run(persona.id, ctx.hour, ctx.location, ctx.transport)
    const addSignal = db.prepare('INSERT INTO signals (event_id, signal_id, label, source) VALUES (?, ?, ?, ?)')
    for (const s of signals) addSignal.run(lastInsertRowid, s.id, s.label, s.source)
    const addRec = db.prepare('INSERT INTO recommendations (event_id, action_id, surface, rank, score) VALUES (?, ?, ?, ?, ?)')
    for (const surface of ['login', 'dashboard'] as const)
      ranked[surface].forEach((a, i) => addRec.run(lastInsertRowid, a.id, surface, i + 1, a.score))
    return Number(lastInsertRowid)
  })

  res.json({ eventId, signals, ...ranked })
})

app.post('/api/interactions', (req, res) => {
  const { customerId, actionId, kind } = req.body ?? {}
  if (!getPersona(customerId) || typeof actionId !== 'string' || !['click', 'why'].includes(kind))
    return res.status(400).json({ error: 'Expected { customerId, actionId, kind: "click"|"why" }' })
  db.prepare('INSERT INTO interactions (customer_id, action_id, kind) VALUES (?, ?, ?)').run(customerId, actionId, kind)
  res.json({ ok: true })
})

app.get('/api/stats', (_req, res) => {
  const totals = db.prepare(`
    SELECT (SELECT COUNT(*) FROM context_events) AS events,
           (SELECT COUNT(*) FROM recommendations) AS recommendations,
           (SELECT COUNT(*) FROM interactions)    AS interactions
  `).get()
  const actions = db.prepare(`
    SELECT r.action_id AS actionId,
           COUNT(*) AS shown,
           (SELECT COUNT(*) FROM interactions i WHERE i.action_id = r.action_id AND i.kind = 'click') AS clicks
    FROM recommendations r
    GROUP BY r.action_id
    ORDER BY clicks DESC, shown DESC
    LIMIT 8
  `).all()
  res.json({ totals, actions })
})

app.listen(PORT, () => console.log(`KBC Right Moment API on http://localhost:${PORT}`))
