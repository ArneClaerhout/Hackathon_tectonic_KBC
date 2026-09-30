import type { Stats } from '../api'
import type { Action, Context, Location, Persona, Signal, Transport } from '../engine/types'

interface Props {
  personas: Persona[]
  persona: Persona
  onPersona: (id: string) => void
  ctx: Context
  onCtx: (c: Context) => void
  signals: Signal[]
  actions: Action[]
  eventId: number
  stats: Stats | null
  error: string | null
}

const LOCATIONS: Location[] = ['home', 'work', 'city', 'shop', 'station', 'abroad']
const TRANSPORTS: { v: Transport; label: string }[] = [
  { v: null, label: 'stationary' }, { v: 'walk', label: '🚶 walking' }, { v: 'car', label: '🚗 driving' }, { v: 'train', label: '🚆 train' },
]
const SOURCE_ICON: Record<Signal['source'], string> = {
  transactions: '💶', profile: '👤', location: '📍', behaviour: '⏱️', device: '📱',
}

export default function ControlRoom({ personas, persona, onPersona, ctx, onCtx, signals, actions, eventId, stats, error }: Props) {
  return (
    <aside className="control">
      <h1><img className="title-logo" src="/logo.png" alt="KBC" /> <span className="accent">Right Moment</span></h1>
      <p className="muted">Signals → situation → the right action, at the right moment. Same engine for 2.3M customers, on every channel.</p>

      <div className={`db-status ${error ? 'err' : ''}`}>
        {error ? `⚠️ ${error}` : `💾 Context event #${eventId} stored in SQLite`}
      </div>

      <h3>1 · Customer</h3>
      <div className="personas">
        {personas.map(p => (
          <button key={p.id} className={`persona ${p.id === persona.id ? 'active' : ''}`} onClick={() => onPersona(p.id)}>
            <span className="emoji">{p.emoji}</span>
            <b>{p.name}</b>
            <span className="small muted">{p.tagline}</span>
          </button>
        ))}
      </div>

      <h3>2 · Live context</h3>
      <div className="ctx">
        <label>
          Time {String(ctx.hour).padStart(2, '0')}:00
          <input type="range" min={0} max={23} value={ctx.hour} onChange={e => onCtx({ ...ctx, hour: +e.target.value })} />
        </label>
        <label>
          Location
          <select value={ctx.location} onChange={e => onCtx({ ...ctx, location: e.target.value as Location })}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </label>
        <label>
          Movement
          <select value={ctx.transport ?? ''} onChange={e => onCtx({ ...ctx, transport: (e.target.value || null) as Transport })}>
            {TRANSPORTS.map(t => <option key={t.label} value={t.v ?? ''}>{t.label}</option>)}
          </select>
        </label>
      </div>

      <div className="cols">
        <div>
          <h3>3 · Detected signals</h3>
          <ul className="signals">
            {signals.length === 0 && <li className="muted">No strong signals: showing defaults</li>}
            {signals.map(s => <li key={s.id}><span>{SOURCE_ICON[s.source]}</span> {s.label}</li>)}
          </ul>
        </div>
        <div>
          <h3>4 · Ranked actions</h3>
          <table className="ranked">
            <tbody>
              {actions.map(a => (
                <tr key={a.id}>
                  <td>{a.icon} {a.label}</td>
                  <td className="small muted">{a.surfaces.join(' + ')}</td>
                  <td><div className="bar" style={{ width: `${Math.min(a.score, 120) / 1.2}%` }}>{a.score}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3>5 · Live data (SQLite)</h3>
      {stats && (
        <div className="stats">
          <div className="kpis">
            <div><b>{stats.totals.events}</b><span className="small muted">context events</span></div>
            <div><b>{stats.totals.recommendations}</b><span className="small muted">recommendations</span></div>
            <div><b>{stats.totals.interactions}</b><span className="small muted">interactions</span></div>
          </div>
          <table className="ranked">
            <thead><tr><th>Action</th><th>Shown</th><th>Clicks</th><th>CTR</th></tr></thead>
            <tbody>
              {stats.actions.map(a => (
                <tr key={a.actionId}>
                  <td>{a.actionId}</td>
                  <td>{a.shown}</td>
                  <td>{a.clicks}</td>
                  <td>{a.shown ? `${Math.round((100 * a.clicks) / a.shown)}%` : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted">Clicks feed back into ranking: every click on an action gives it +5 for that customer (max +15).</p>
        </div>
      )}

      <p className="small muted footnote">
        🔐 Privacy by design: every suggestion shows its reason (ⓘ), runs on explainable rules and can be switched off by the customer.
        Scales because scoring is stateless and cheap: run it on-device or at the edge per event, not in a batch for millions.
      </p>
    </aside>
  )
}
