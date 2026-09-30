# KBC Right Moment

Proof of concept for the **KBC challenge** at the Tectonic hackathon: *how can a bank understand what a customer needs and respond at exactly the right moment, for 2.3 million customers?*

Our answer: **contextual quick actions**. The login screen and the dashboard of the KBC app show a few buttons that adapt to the customer's situation, behaviour and intent. Pay parking when you've just parked. A train ticket when you're at the station. A savings account for your newborn. And a calm "you're on track" overview when you open the app at 3 AM.

## The idea

```
signals  →  situation  →  ranked actions  →  button on the right surface
```

1. **Signals** come from transactions (salary in, unusual inflow, idle savings, subscriptions, daycare payments), the profile (milestones like 18/21/65, a new child in the family), behaviour (time of day, late-night use), the device (new phone) and location (parked, on the train, abroad, in a shop).
2. **Rules** turn signals into scored actions. Each action says *why* it is shown.
3. **Surfaces**: only low-risk actions (show card, pay parking, train ticket, block card, balance) appear on the **login screen** before authentication. Richer suggestions go into the **"✨ For you, now"** widget on the dashboard.
4. **Feedback loop**: every interaction is stored. Actions a customer clicks get a boost for that customer (+5 per click, max +15).

**Why it scales:** scoring is stateless and cheap. It runs per event (on-device, at the edge or in a small service), not as a nightly batch over millions of customers, and the same engine can serve the app, the website and the branch.

**Why customers can trust it:** every button has an ⓘ that explains in plain language which signals triggered it. The rules are explainable, and late-night visits lead with reassurance, not sales.

## Demo

The page shows a phone mockup (left) and a **control room** (right) where you pick a customer and change the live context (time, location, movement). The buttons re-rank instantly, and every change is stored in the database.

| Customer | Situation | What they see |
| --- | --- | --- |
| 🎓 Lotte | Turns 18 next week, in a shop, new phone | *Show card* · *Turning 18? Open your own account* |
| 🚗 Jonas | Commuter, salary just in, 5 subscriptions | *Pay parking* when parked, *Train ticket* at the station |
| 🍼 Sarah | Baby born 2 months ago, daycare payments | *Start a savings account for your child* · *Check your family insurance* |
| 🧓 Marc | 58, €45k inheritance, savings idle for 3 years | At 03:00: *You're on track: see overview*. During the day: *Put idle savings to work* · *Talk to an advisor* |

## Getting started

Requires **Node.js 22.13+**, which ships SQLite built in (`node:sqlite`).

```bash
npm install
npm run dev
```

- Web app: http://localhost:5173 (Vite forwards `/api` to the backend)
- API: http://localhost:3001

The SQLite database `kbc.db` is created automatically and seeded with the 4 demo customers. To reset it, stop the servers, delete `kbc.db*` and run `npm run dev` again. Node prints an "SQLite is experimental" warning, which is harmless.

Other scripts:

```bash
npm run server   # API only
npm run build    # typecheck + production build of the frontend
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/customers` | All customers (personas) |
| `POST` | `/api/customers/:id/context` | Body `{ hour, location, transport }`. Detects signals, ranks actions, stores the event and returns `{ eventId, signals, login, dashboard, all }` |
| `POST` | `/api/interactions` | Body `{ customerId, actionId, kind: "click" \| "why" }` |
| `GET` | `/api/stats` | Totals plus shown/clicks per action |

`location` is one of `home | work | city | shop | station | abroad`. `transport` is one of `walk | car | train | null`.

```bash
curl -X POST http://localhost:3001/api/customers/jonas/context \
  -H "Content-Type: application/json" \
  -d '{"hour":8,"location":"station","transport":"train"}'
```

## Database

| Table | Contents |
| --- | --- |
| `customers` | Persona JSON (seeded from `src/data/personas.ts`) |
| `context_events` | Every context update: customer, hour, location, transport |
| `signals` | Signals detected per event |
| `recommendations` | Actions shown per event, surface, rank and score |
| `interactions` | Button clicks and "why?" taps |

## Project structure

```
public/logo.png      KBC logo (login screen, dashboard, control room, favicon)
server/
  index.ts           Express REST API
  db.ts              SQLite schema, seeding, transaction helper
src/
  engine/
    types.ts         Persona, Context, Signal, Action
    signals.ts       detectSignals(persona, context)
    rules.ts         rules, scoring and rankActions(signals, context, feedback)
  data/personas.ts   demo customers (database seed)
  api.ts             fetch wrappers for the frontend
  components/        LoginScreen, Dashboard, ActionButton, ControlRoom
  App.tsx
```

**Adding a new moment:** add a signal in `src/engine/signals.ts`, then add a rule in `src/engine/rules.ts` with the signals it needs, a weight, the surfaces it may appear on and a reason.

## Roadmap

- ML-based customer profiles from spending clusters, alongside the explainable rules
- Real consent and preference centre: customers choose which signals may be used
- Subscriptions controller, idle-capital coach, Tectonic coins (rewards for good financial habits)
- Other channels: website, notifications, advisor view in the branch
- A/B testing and uplift measurement on the interaction data

## Stack

React 18 · TypeScript · Vite · Express · SQLite (`node:sqlite`)
