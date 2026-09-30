import { useCallback, useEffect, useState } from 'react'
import { getCustomers, getStats, postContext, postInteraction, type InteractionKind, type Recommendation, type Stats } from './api'
import type { Context, Persona } from './engine/types'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'
import ControlRoom from './components/ControlRoom'

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [persona, setPersona] = useState<Persona | null>(null)
  const [ctx, setCtx] = useState<Context | null>(null)
  const [rec, setRec] = useState<Recommendation | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [screen, setScreen] = useState<'login' | 'dashboard'>('login')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCustomers()
      .then(list => { setPersonas(list); setPersona(list[0]); setCtx(list[0].defaultContext) })
      .catch(e => setError(String(e)))
  }, [])

  const refresh = useCallback(async (p: Persona, c: Context) => {
    try {
      setRec(await postContext(p.id, c))
      setStats(await getStats())
      setError(null)
    } catch (e) {
      setError(String(e))
    }
  }, [])

  // Debounced so dragging the time slider doesn't flood the API.
  useEffect(() => {
    if (!persona || !ctx) return
    const t = setTimeout(() => refresh(persona, ctx), 150)
    return () => clearTimeout(t)
  }, [persona, ctx, refresh])

  const selectPersona = (id: string) => {
    const p = personas.find(x => x.id === id)!
    setPersona(p)
    setCtx(p.defaultContext)
    setScreen('login')
  }

  const interact = async (actionId: string, kind: InteractionKind) => {
    if (!persona || !ctx) return
    await postInteraction(persona.id, actionId, kind).catch(e => setError(String(e)))
    refresh(persona, ctx)
  }

  if (!persona || !ctx || !rec)
    return <div className="boot">{error ? `⚠️ Backend not reachable (${error}). Is the API running? Try npm run dev` : 'Loading…'}</div>

  return (
    <div className="stage">
      <div className="phone">
        <div className={`statusbar ${screen === 'login' ? 'overlay' : ''}`}>
          <span>{String(ctx.hour).padStart(2, '0')}:00</span>
          <span>📶 🔋</span>
        </div>
        {screen === 'login'
          ? <LoginScreen persona={persona} actions={rec.login} onInteract={interact} onLogin={() => setScreen('dashboard')} />
          : <Dashboard persona={persona} actions={rec.dashboard} hour={ctx.hour} onInteract={interact} onLogout={() => setScreen('login')} />}
      </div>
      <ControlRoom
        personas={personas}
        persona={persona}
        onPersona={selectPersona}
        ctx={ctx}
        onCtx={setCtx}
        signals={rec.signals}
        actions={rec.all}
        eventId={rec.eventId}
        stats={stats}
        error={error}
      />
    </div>
  )
}
