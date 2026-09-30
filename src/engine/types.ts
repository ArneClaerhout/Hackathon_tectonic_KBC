export type Location = 'home' | 'work' | 'station' | 'abroad' | 'shop' | 'city'
export type Transport = 'walk' | 'car' | 'train' | null

export interface Transaction {
  daysAgo: number
  amount: number // positive = inflow
  merchant: string
  category: 'salary' | 'subscription' | 'groceries' | 'parking' | 'transport' | 'childcare' | 'leisure' | 'transfer' | 'fuel'
}

export interface Context {
  hour: number
  location: Location
  transport: Transport
}

export interface Persona {
  id: string
  name: string
  emoji: string
  tagline: string
  age: number
  daysToBirthday: number
  balance: number
  savings: number
  daysSinceSavingsTouched: number
  familyChangeDaysAgo: number | null // new child added to family
  newDevice: boolean
  hasCar: boolean
  transactions: Transaction[]
  defaultContext: Context
}

export interface Signal {
  id: string
  label: string
  source: 'transactions' | 'profile' | 'location' | 'behaviour' | 'device'
}

export type Surface = 'login' | 'dashboard'

export interface Action {
  id: string
  label: string
  icon: string
  reason: string
  surfaces: Surface[]
  score: number
  matched: string[] // signal ids that triggered it
}
