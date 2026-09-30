import type { Context, Persona, Signal } from './types'

export const eur = (n: number) => `€${Math.round(n).toLocaleString('nl-BE')}`

export function detectSignals(p: Persona, ctx: Context): Signal[] {
  const s: Signal[] = []
  const tx = p.transactions

  const salary = tx.find(t => t.category === 'salary' && t.daysAgo <= 2)
  if (salary) s.push({ id: 'salaryJustIn', label: `Salary of ${eur(salary.amount)} arrived`, source: 'transactions' })

  const big = tx.find(t => t.amount > 5000 && t.category !== 'salary' && t.daysAgo <= 14)
  if (big) s.push({ id: 'suddenInflow', label: `Unusual inflow: ${eur(big.amount)} (${big.merchant})`, source: 'transactions' })

  if (p.savings > 10000 && p.daysSinceSavingsTouched > 365)
    s.push({ id: 'idleCapital', label: `${eur(p.savings)} untouched for ${Math.floor(p.daysSinceSavingsTouched / 365)}+ years`, source: 'transactions' })

  const subs = tx.filter(t => t.category === 'subscription')
  if (subs.length >= 4)
    s.push({ id: 'manySubscriptions', label: `${subs.length} recurring subscriptions (${eur(-subs.reduce((a, t) => a + t.amount, 0))}/month)`, source: 'transactions' })

  if (tx.some(t => t.category === 'childcare')) s.push({ id: 'childcarePayments', label: 'Recurring daycare payments', source: 'transactions' })
  if (p.familyChangeDaysAgo !== null && p.familyChangeDaysAgo < 180)
    s.push({ id: 'newFamilyMember', label: `New child added to family ${p.familyChangeDaysAgo} days ago`, source: 'profile' })

  const nextAge = p.age + 1
  if ([18, 21, 65].includes(nextAge) && p.daysToBirthday <= 30)
    s.push({ id: `milestone${nextAge}`, label: `Turns ${nextAge} in ${p.daysToBirthday} days`, source: 'profile' })
  if (p.age >= 55 && p.age < 65) s.push({ id: 'preRetirement', label: `Age ${p.age}: retirement within 10 years`, source: 'profile' })

  if (p.newDevice) s.push({ id: 'newDevice', label: 'Logged in from a new device', source: 'device' })
  if (ctx.hour >= 1 && ctx.hour < 5) s.push({ id: 'lateNight', label: `Opening the app at ${ctx.hour}:00 at night`, source: 'behaviour' })

  if (p.hasCar && ctx.transport === null && ['city', 'shop', 'work'].includes(ctx.location))
    s.push({ id: 'parkedCar', label: `Car just parked (${ctx.location})`, source: 'location' })
  if (ctx.transport === 'car') s.push({ id: 'driving', label: 'Currently driving', source: 'location' })
  if (ctx.transport === 'train' || ctx.location === 'station')
    s.push({ id: 'onTrain', label: ctx.transport === 'train' ? 'Travelling by train' : 'At a train station', source: 'location' })
  if (ctx.location === 'abroad') s.push({ id: 'abroad', label: 'Phone is abroad', source: 'location' })
  if (ctx.location === 'shop') s.push({ id: 'atShop', label: 'In a shop', source: 'location' })

  return s
}
