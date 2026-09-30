import type { Persona, Transaction } from '../engine/types'

const SUBS: [string, number][] = [
  ['Netflix', -17.99], ['Spotify', -11.99], ['Disney+', -10.99], ['Basic-Fit', -29.99], ['Streamz', -12.95], ['iCloud', -2.99],
]
const subs = (n: number): Transaction[] =>
  SUBS.slice(0, n).map(([merchant, amount], i) => ({ daysAgo: 3 + i * 4, amount, merchant, category: 'subscription' }))

export const PERSONAS: Persona[] = [
  {
    id: 'lotte', name: 'Lotte', emoji: '🎓', tagline: 'Student, turns 18 next week',
    age: 17, daysToBirthday: 6, balance: 412, savings: 1850, daysSinceSavingsTouched: 90,
    familyChangeDaysAgo: null, newDevice: true, hasCar: false,
    transactions: [
      { daysAgo: 1, amount: -8.5, merchant: 'Pizza Hut Gent', category: 'leisure' },
      { daysAgo: 3, amount: -2.5, merchant: 'De Lijn', category: 'transport' },
      { daysAgo: 5, amount: 60, merchant: 'Mama (pocket money)', category: 'transfer' },
      ...subs(2),
    ],
    defaultContext: { hour: 16, location: 'shop', transport: 'walk' },
  },
  {
    id: 'jonas', name: 'Jonas', emoji: '🚗', tagline: 'Commuter, drives and takes the NMBS',
    age: 34, daysToBirthday: 140, balance: 3240, savings: 8200, daysSinceSavingsTouched: 60,
    familyChangeDaysAgo: null, newDevice: false, hasCar: true,
    transactions: [
      { daysAgo: 1, amount: 3150, merchant: 'Employer NV', category: 'salary' },
      { daysAgo: 2, amount: -4.2, merchant: '4411 Parking Gent', category: 'parking' },
      { daysAgo: 4, amount: -68, merchant: 'TotalEnergies', category: 'fuel' },
      { daysAgo: 6, amount: -9.4, merchant: 'NMBS Gent-Sint-Pieters', category: 'transport' },
      ...subs(5),
    ],
    defaultContext: { hour: 8, location: 'city', transport: null },
  },
  {
    id: 'sarah', name: 'Sarah', emoji: '🍼', tagline: 'Young parent, baby born 2 months ago',
    age: 31, daysToBirthday: 200, balance: 2180, savings: 6400, daysSinceSavingsTouched: 45,
    familyChangeDaysAgo: 58, newDevice: false, hasCar: false,
    transactions: [
      { daysAgo: 12, amount: 2780, merchant: 'Employer BV', category: 'salary' },
      { daysAgo: 3, amount: -410, merchant: 'Daycare Het Nestje', category: 'childcare' },
      { daysAgo: 5, amount: -96, merchant: 'Colruyt', category: 'groceries' },
      ...subs(3),
    ],
    defaultContext: { hour: 13, location: 'home', transport: null },
  },
  {
    id: 'marc', name: 'Marc', emoji: '🧓', tagline: '58, just received an inheritance',
    age: 58, daysToBirthday: 90, balance: 48900, savings: 12000, daysSinceSavingsTouched: 1200,
    familyChangeDaysAgo: null, newDevice: false, hasCar: true,
    transactions: [
      { daysAgo: 6, amount: 45000, merchant: 'Notary Peeters (inheritance)', category: 'transfer' },
      { daysAgo: 20, amount: 3400, merchant: 'Pension fund', category: 'salary' },
      { daysAgo: 8, amount: -120, merchant: 'Delhaize', category: 'groceries' },
      ...subs(1),
    ],
    defaultContext: { hour: 3, location: 'home', transport: null },
  },
]
