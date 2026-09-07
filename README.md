# T-CAMS

Training & Compliance Administration Management System — a guard-driven,
audit-logged workflow platform covering registrar, library, department,
budget/finance, and HR administration, with a generic config-driven React
frontend.

## Architecture

- `server/` — Node.js/Express API, Mongoose/MongoDB. Every status change
  flows through a single `transitionStatus` choke-point that enforces
  domain guards (`guardService.js`) and writes an immutable `AuditLog`
  entry tagged with the governing use-case code (see
  `server/src/config/useCases.js`).
- `client/` — Vite + React 18 + Tailwind. A single config-driven UI
  (`client/src/config/moduleConfig.js`) renders list/detail/approval
  screens for every module without per-entity pages.
- `scripts/seed.js` — idempotent seed script that populates demo users,
  supporting reference data, and sample workflows in various states.

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local or remote) reachable via a connection
  string

## 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 2. Configure environment variables

**Backend** — copy the example file and fill in real values:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/tcams
JWT_SECRET=<a long random value>
JWT_EXPIRES_IN=8h
```

Generate a real `JWT_SECRET` rather than using the placeholder:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server refuses to start if `JWT_SECRET` is not set.

**Frontend** — copy the example file:

```bash
cd ../client
cp .env.example .env
```

`client/.env` should point at the backend API:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

## 3. Seed the database

With `server/.env` configured and MongoDB reachable, run the seed script
from the `server` directory:

```bash
cd server
npm run seed
```

This is safe to re-run — existing documents are matched by natural key and
left untouched. It creates:

- **Roles & users** — one demo user per role, all with the password
  `Password123!`:

  | Email | Role |
  | --- | --- |
  | `admin@tcams.local` | ADMIN |
  | `registrar@tcams.local` | REGISTRAR |
  | `procurement@tcams.local` | PROCUREMENT_OFFICER |
  | `hr@tcams.local` | HR_OFFICER |
  | `finance@tcams.local` | FINANCE_OFFICER |
  | `auditor@tcams.local` | AUDITOR |
  | `library@tcams.local` | LIBRARY_OFFICER |
  | `department@tcams.local` | DEPARTMENT_HEAD |
  | `budget@tcams.local` | BUDGET_OFFICER |
  | `advisor@tcams.local` | ADVISOR |

- **Supporting data** — an approved vendor, a program/course/section, a
  room, a healthy budget allocation, a *near-exhausted* "Tight Demo
  Budget" allocation, a stock item, and a leave balance — so guard rules
  (`assertBudgetAvailable`, `assertNoOverdueLoans`, etc.) have real data to
  evaluate.
- **Sample workflows**, pushed through the real service layer so each has
  a genuine `AuditLog` trail:
  - A **pending** `LoanRequest`, and a second loan that was issued,
    backdated, and returned — producing a real overdue `Fine`.
  - A trainer with a scheduled training session.
  - A `MonthlyBudgetReport` driven through the full RPB approval chain to
    `APPROVED`.
  - A finalized bid evaluation and an issued purchase order.
  - A full HR chain: an approved recruitment requisition, a shortlisted
    application, two activated employment contracts, an **approved**
    leave request, and (seeded afterwards, on purpose) a **pending**
    medical clearance for the same employee.

### Guard-rule demos worth trying live

- **Budget guard**: submit a `MaterialRequest` or `ExpenseClaim` against
  the "Tight Demo Budget" allocation (fiscal year 2026) — it should be
  blocked by `assertBudgetAvailable`.
- **HR clearance hold**: submit a new `LeaveRequest` or training
  enrollment for "Jane HR Sample" — it should be blocked by
  `assertNoActiveClearanceHold` because of her pending `MedicalClearance`.

## 4. Run the app

In one terminal, start the backend:

```bash
cd server
npm run dev
```

In another terminal, start the frontend:

```bash
cd client
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## 5. Log in and explore

Log in with any seeded email above and the password `Password123!`. The
sidebar shows only the modules that user's role has access to (see
`client/src/config/moduleConfig.js`). Try:

1. Logging in as `library@tcams.local` and approving the pending
   `LoanRequest`.
2. Logging in as `budget@tcams.local` and reviewing the already-approved
   `MonthlyBudgetReport`'s audit timeline.
3. Logging in as `hr@tcams.local` and attempting a new leave request for
   Jane HR Sample to see the clearance-hold guard fire.
4. Reviewing `/audit` (via the Auditor role) for the full compliance trail
   left by every seeded workflow.

## Authentication

- `POST /api/auth/login` accepts `{ email, password }` and returns a JWT.
- All other `/api/*` routes (except `/api/health` and `/api/use-cases`)
  require `Authorization: Bearer <token>`.
- The frontend's `AuthContext` stores the token and attaches it to every
  API request; an expired or missing token redirects to `/login`.
