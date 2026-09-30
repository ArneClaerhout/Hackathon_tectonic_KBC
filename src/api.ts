import type { Action, Context, Persona, Signal } from './engine/types'

export type InteractionKind = 'click' | 'why'

export interface Recommendation {
  eventId: number
  signals: Signal[]
  login: Action[]
  dashboard: Action[]
  all: Action[]
}

export interface Stats {
  totals: { events: number; recommendations: number; interactions: number }
  actions: { actionId: string; shown: number; clicks: number }[]
}

async function call<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

export const getCustomers = () => call<Persona[]>('/api/customers')
export const postContext = (customerId: string, ctx: Context) => call<Recommendation>(`/api/customers/${customerId}/context`, ctx)
export const postInteraction = (customerId: string, actionId: string, kind: InteractionKind) =>
  call<{ ok: true }>('/api/interactions', { customerId, actionId, kind })
export const getStats = () => call<Stats>('/api/stats')
