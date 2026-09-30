import { useState } from 'react'
import type { InteractionKind } from '../api'
import type { Action } from '../engine/types'
import ActionIcon from './ActionIcon'
import StandardIcon, { hasStandardIcon } from './StandardIcon'

interface Props {
  action: Action
  variant: 'tile' | 'row'
  onInteract: (actionId: string, kind: InteractionKind) => void
  // When given, the parent owns the "why" state and renders the reason itself (used by the tile row).
  whyOpen?: boolean
  onWhy?: () => void
}

export default function ActionButton({ action, variant, onInteract, whyOpen, onWhy }: Props) {
  const [localOpen, setLocalOpen] = useState(false)
  const [done, setDone] = useState(false)
  const contextual = action.score > 0
  const open = onWhy ? !!whyOpen : localOpen

  const click = () => {
    setDone(true)
    setTimeout(() => setDone(false), 1200)
    onInteract(action.id, 'click')
  }
  const toggleWhy = () => {
    if (!open) onInteract(action.id, 'why')
    if (onWhy) onWhy()
    else setLocalOpen(o => !o)
  }

  return (
    <div className={`action ${variant} ${contextual ? 'contextual' : 'standard'} ${open ? 'why-open' : ''}`}>
      <button className="action-main" onClick={click}>
        <span className="action-icon">{done ? '✅' : hasStandardIcon(action.id) ? <StandardIcon id={action.id} /> : <ActionIcon icon={action.icon} />}</span>
        <span className="action-label">{action.label}</span>
      </button>
      {contextual && <button className="why" title="Why am I seeing this?" onClick={toggleWhy}>ⓘ</button>}
      {open && !onWhy && <div className="reason">{action.reason}</div>}
    </div>
  )
}
