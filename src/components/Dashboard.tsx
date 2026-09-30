import { eur } from '../engine/signals'
import type { InteractionKind } from '../api'
import type { Action, Persona } from '../engine/types'
import ActionButton from './ActionButton'

interface Props {
  persona: Persona
  actions: Action[]
  hour: number
  onInteract: (actionId: string, kind: InteractionKind) => void
  onLogout: () => void
}

export default function Dashboard({ persona, actions, hour, onInteract, onLogout }: Props) {
  const recent = [...persona.transactions].sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 4)
  return (
    <div className="screen dashboard">
      <header className="dash-head">
        <span className="dash-greet"><img src="/logo.png" alt="KBC" /> Good {greeting(hour)}, {persona.name}</span>
        <button className="link" onClick={onLogout}>Log out</button>
      </header>

      <div className="card account">
        <div className="muted">Current account</div>
        <div className="big">{eur(persona.balance)}</div>
        <div className="muted small">Savings {eur(persona.savings)}</div>
      </div>

      <section className="widget">
        <div className="widget-title">✨ For you, now</div>
        {actions.map(a => <ActionButton key={a.id} action={a} variant="row" onInteract={onInteract} />)}
      </section>

      <section className="card">
        <div className="muted small">Recent</div>
        {recent.map((t, i) => (
          <div className="tx" key={i}>
            <span>{t.merchant}</span>
            <span className={t.amount > 0 ? 'pos' : ''}>{t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}</span>
          </div>
        ))}
      </section>
    </div>
  )
}

function greeting(h: number) {
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
