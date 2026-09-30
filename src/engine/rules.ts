import type { Action, Context, Signal, Surface } from './types'

interface Rule {
  id: string
  label: string
  icon: string
  surfaces: Surface[]
  needs: string[] // any of these signals triggers the rule
  weight: number
  reason: (matched: Signal[]) => string
  boost?: (ctx: Context) => number
}

const why = (m: Signal[]) => m.map(x => x.label).join(' · ')
const rushHour = (c: Context) => (c.hour >= 7 && c.hour <= 9 ? 10 : 0)

// Only low-risk actions are allowed on the login screen (before full authentication).
const RULES: Rule[] = [
  { id: 'park4411', label: 'Park with 4411', icon: '🅿️', surfaces: ['login', 'dashboard'], needs: ['parkedCar'], weight: 90, reason: m => `${why(m)}. Start a 4411 parking session in one tap.` },
  { id: 'nmbsTicket', label: 'NMBS ticket', icon: '🚆', surfaces: ['login', 'dashboard'], needs: ['onNmbs'], weight: 85, reason: m => `${why(m)}. Buy your NMBS train ticket without leaving the app.`, boost: rushHour },
  { id: 'deLijnTicket', label: 'De Lijn ticket', icon: '🚌', surfaces: ['login', 'dashboard'], needs: ['onDeLijn'], weight: 85, reason: m => `${why(m)}. Buy your De Lijn ticket in one tap.`, boost: rushHour },
  { id: 'travelInsurance', label: 'Travel cover', icon: '🧳', surfaces: ['login', 'dashboard'], needs: ['abroad'], weight: 75, reason: m => `${why(m)}. Check your travel insurance and emergency number.` },
  { id: 'showCard', label: 'Show card', icon: '💳', surfaces: ['login'], needs: ['atShop', 'abroad'], weight: 70, reason: m => `${why(m)}. Your card, ready to pay.` },
  { id: 'balance', label: 'Balance', icon: '👁️', surfaces: ['login'], needs: ['salaryJustIn', 'lateNight', 'suddenInflow'], weight: 50, reason: m => `${why(m)}. Peek at your balance without logging in.` },
  { id: 'blockCard', label: 'Block card', icon: '🔒', surfaces: ['login'], needs: ['newDevice', 'lateNight', 'abroad'], weight: 40, reason: m => `${why(m)}. Quick safety access, just in case.` },
  { id: 'calmOverview', label: 'You’re on track: see overview', icon: '🌙', surfaces: ['dashboard'], needs: ['lateNight'], weight: 95, reason: m => `${why(m)}. Late-night visits often mean worry, so we lead with reassurance, not offers.` },
  { id: 'kidsSavings', label: 'Start a savings account for your child', icon: '🍼', surfaces: ['dashboard'], needs: ['newFamilyMember'], weight: 92, reason: m => `${why(m)}. Congratulations! Starting early makes a big difference.` },
  { id: 'ownAccount', label: 'Turning 18? Open your own account', icon: '🎂', surfaces: ['dashboard'], needs: ['milestone18'], weight: 88, reason: m => `${why(m)}. Take over your youth account and get your own card.` },
  { id: 'idleInvest', label: 'Put idle savings to work', icon: '📈', surfaces: ['dashboard'], needs: ['idleCapital', 'suddenInflow'], weight: 80, reason: m => `${why(m)}. Explore options that fit your risk profile.` },
  { id: 'advisor', label: 'Talk to an advisor', icon: '🤝', surfaces: ['dashboard'], needs: ['suddenInflow', 'preRetirement'], weight: 72, reason: m => `${why(m)}. Big moments deserve a real conversation.` },
  { id: 'familyInsurance', label: 'Check your family insurance', icon: '👨‍👩‍👧', surfaces: ['dashboard'], needs: ['newFamilyMember', 'childcarePayments'], weight: 70, reason: m => `${why(m)}. Make sure your cover grew with your family.` },
  { id: 'secureDevice', label: 'Confirm your new device', icon: '📱', surfaces: ['dashboard'], needs: ['newDevice'], weight: 65, reason: m => `${why(m)}. Keep your account secure.` },
  { id: 'subscriptions', label: 'Review your subscriptions', icon: '🔁', surfaces: ['dashboard'], needs: ['manySubscriptions'], weight: 60, reason: m => `${why(m)}. Spot the ones you no longer use.` },
  { id: 'autoSave', label: 'Auto-save part of your salary', icon: '🐷', surfaces: ['dashboard'], needs: ['salaryJustIn'], weight: 55, reason: m => `${why(m)}. Payday is the easiest moment to save.` },
  { id: 'splitBill', label: 'Split a bill with friends', icon: '🍕', surfaces: ['dashboard'], needs: ['milestone18', 'milestone21'], weight: 45, reason: m => `${why(m)}. Popular with customers your age.` },
]

type Base = Omit<Action, 'score' | 'matched'>

// Standard actions: always shown on login after the contextual ones; fill up the dashboard widget.
const DEFAULTS: Record<Surface, Base[]> = {
  // Mirrors the fixed tiles of the real KBC login screen.
  login: [
    { id: 'qrPay', label: 'Pay with QR code', icon: '🔳', reason: 'Standard quick action.', surfaces: ['login'] },
    { id: 'wallet', label: 'Kate Wallet', icon: '👛', reason: 'Standard quick action.', surfaces: ['login'] },
    { id: 'receive', label: 'Receive money', icon: '📲', reason: 'Standard quick action.', surfaces: ['login'] },
    { id: 'kateCoins', label: 'Kate Coins', icon: '🪙', reason: 'Standard quick action.', surfaces: ['login'] },
  ],
  dashboard: [
    { id: 'transfer', label: 'New transfer', icon: '💸', reason: 'Standard action (no specific signal).', surfaces: ['dashboard'] },
    { id: 'insights', label: 'Your monthly insights', icon: '📊', reason: 'Standard action (no specific signal).', surfaces: ['dashboard'] },
    { id: 'goals', label: 'Set a savings goal', icon: '🎯', reason: 'Standard action (no specific signal).', surfaces: ['dashboard'] },
  ],
}

// feedback: extra points per action learned from past clicks (see server).
export function scoreAll(signals: Signal[], ctx: Context, feedback: Record<string, number> = {}): Action[] {
  const byId = new Map(signals.map(s => [s.id, s]))
  return RULES.flatMap(r => {
    const matched = r.needs.map(n => byId.get(n)).filter((x): x is Signal => !!x)
    if (!matched.length) return []
    // More matching signals means more confidence (diminishing returns).
    const score = Math.round(r.weight * (1 + 0.15 * (matched.length - 1)) + (r.boost?.(ctx) ?? 0) + Math.min(feedback[r.id] ?? 0, 15))
    return [{ id: r.id, label: r.label, icon: r.icon, surfaces: r.surfaces, reason: r.reason(matched), score, matched: matched.map(m => m.id) }]
  }).sort((a, b) => b.score - a.score)
}

export function rankActions(signals: Signal[], ctx: Context, feedback: Record<string, number> = {}) {
  const all = scoreAll(signals, ctx, feedback)
  const pick = (surface: Surface, n: number, total: number): Action[] => {
    const out = all.filter(a => a.surfaces.includes(surface)).slice(0, n)
    for (const d of DEFAULTS[surface]) {
      if (out.length >= total) break
      if (!out.some(a => a.id === d.id)) out.push({ ...d, score: 0, matched: [] })
    }
    return out
  }
  return { all, login: pick('login', 3, 3 + DEFAULTS.login.length), dashboard: pick('dashboard', 3, 3) }
}
