import { useState } from 'react'
import type { InteractionKind } from '../api'
import type { Action, Persona } from '../engine/types'
import ActionButton from './ActionButton'

interface Props {
  persona: Persona
  actions: Action[]
  onInteract: (actionId: string, kind: InteractionKind) => void
  onLogin: () => void
}

// Modelled on the real KBC app login screen: hero image, slogan tab, tile row, big "Log in" button.
export default function LoginScreen({ persona, actions, onInteract, onLogin }: Props) {
  const [whyId, setWhyId] = useState<string | null>(null)
  const why = actions.find(a => a.id === whyId)

  return (
    <div className="screen login">
      <div className="login-top">
        <button className="more" aria-label="More">•••</button>
        <div className="slogan-tab">
          <img src="/logo.png" alt="KBC" />
          <span>Moves<br />with you.</span>
        </div>
      </div>

      <div className="hero">
        <h2>Hi {persona.name},</h2>
        <p>we’re ready when you are.</p>
      </div>

      <button className="chat-pill">💬 Check your conversation <span>›</span></button>

      {why && (
        <div className="why-bubble" onClick={() => setWhyId(null)}>
          <b>{why.icon} Why am I seeing this?</b>
          <span>{why.reason}</span>
        </div>
      )}

      <div className="tile-row">
        {actions.map(a => (
          <ActionButton
            key={a.id}
            action={a}
            variant="tile"
            onInteract={onInteract}
            whyOpen={whyId === a.id}
            onWhy={() => setWhyId(id => (id === a.id ? null : a.id))}
          />
        ))}
      </div>

      <button className="login-btn" onClick={onLogin}>Log in</button>
    </div>
  )
}
