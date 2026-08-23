# RidePicker — Integration Handoff

This document describes how the RidePicker frontend is structured so it can be
exported, the Base44 project deleted, and Supabase + the RidePicker WhatsApp
backend + a payment provider connected **by replacing service implementations
and environment variables** — without redesigning or rewriting pages.

---

## Current API / WhatsApp pairing status

The real adapters in `src/lib/services/api/*` are now implemented against the
current RidePicker Railway backend. In `VITE_DATA_MODE=api`, account, profile,
jobs, activity, RidePicker mode, WhatsApp and billing state are read through
`VITE_RIDEPICKER_API_URL`; Supabase credentials stay on the backend.

The primary WhatsApp flow is now **phone-number pairing**, not QR.
`whatsappService.startSession(userId)` requests
`POST /api/users/:userId/whatsapp/pairing-code`, displays
`session.pairingCode.code`, and polling continues until `status=connected`. The
backend uses the RidePicker login phone when the request body is empty. QR
endpoints remain backend fallback operations only.

---

## 1. Frontend architecture

```
src/
  App.jsx                  Router. Public routes (Landing, LearnMore, login,
                           register) + protected app routes under AppLayout.
  main.jsx                 React root.
  index.css / tailwind      Design tokens (slate + emerald).
  lib/
    config.js              SINGLE place that reads env vars. Everyone imports
                           from here.
    AuthContext.jsx        Phone-only auth state. No Base44 runtime dependency.
    product/
      ProductContext.jsx   Central product state. Talks ONLY to services —
                           never to mockDataStore. Loads all data
                           asynchronously with explicit loading states.
      useRidePickerMode.js Shared mode controller (blocks Autopilot).
    services/              Public service facades (the app talks to these).
      notConfigured.js     Controlled "adapter not configured" stub used by
                           every facade when VITE_DATA_MODE=api but the API
                           adapter does not exist yet (never falls back to mock).
      authService.js
      profileService.js
      jobsService.js
      activityService.js
      ridePickerService.js
      whatsappService.js
      billingService.js
      mock/                Mock implementations (the only place that imports
                           mockDataStore).
        mockAuthService.js … mockBillingService.js
      api/                 (create when wiring real backends)
        authApi.js, profileApi.js, jobsApi.js, activityApi.js,
        ridePickerApi.js, whatsappApi.js, billingApi.js
    mock/
      mockDataStore.js     In-browser localStorage store. Mock-only.
      devAccountSeed.js    Seeded dev account (+37067837730) + demo data.
```

**Rules:**
- `mockDataStore` is imported only inside `src/lib/services/mock/*`.
- Pages and `ProductContext` import only from `src/lib/services/*` and `src/lib/config`.
- No runtime file imports `@base44/sdk` or `src/api/base44Client`.

---

## 2. Service facades select their implementation

Each public service in `src/lib/services/*.js` is a facade selected by
`VITE_DATA_MODE`:

- **`mock`** uses the in-browser `mockDataStore` implementations.
- **`api`** uses the implemented HTTP adapters in `src/lib/services/api/*`.

All API adapters call the same RidePicker backend URL. Supabase access stays on
the backend, so the frontend does not need database credentials.

| Service | Methods (async unless noted) |
|---|---|
| authService | `subscribe`, `getSession`, `clearSession`/`logout`, `lookupByPhone`, `isDevUser`, `resetDevAccount`, `openExistingAccount`, `signUp` |
| profileService | `subscribe`, `get`, `update` |
| jobsService | `subscribe`, `list`, `get`, `updateStatus`, `updatePayment`, `addExpense`, `removeExpense` |
| activityService | `subscribe`, `list`, `add` |
| ridePickerService | `subscribe`, `getState`, `setMode` |
| whatsappService | `subscribe`, `getSession`, `refreshSession`, `startSession`, `refreshPairingCode`, `refreshQr` (fallback), `disconnect`, `retryReconnect`, `simulateDrop` (mock/dev) |
| billingService | `PLAN`, `getSubscription`, `getPaymentUrl`, `subscribe`, `activate`, `simulatePaymentFailure`, `updatePaymentMethod`, `cancel`, `reactivate`, `reset` |

---

## 3. Environment variables

All env is read once in `src/lib/config.js`.

| Var | Purpose |
|---|---|
| `VITE_DATA_MODE` | `mock` (default) or `api`. |
| `VITE_RIDEPICKER_API_URL` | Base URL for the Railway RidePicker API used by all real adapters. |
| `VITE_PAYMENT_URL` | External checkout/payment-management URL. |
| `VITE_ENABLE_DEV_TOOLS` | Shows development-only controls when `true`. |

Never put `SUPABASE_SERVICE_ROLE_KEY`, an internal backend API key, or any other
server secret in frontend environment variables.

---

## 4. Mock and API modes

`VITE_DATA_MODE=mock` remains a self-contained demo using localStorage.

`VITE_DATA_MODE=api` uses the real adapters. Account lookup/sign-up, profile,
jobs, activity, RidePicker mode, WhatsApp session state and billing state all go
through `VITE_RIDEPICKER_API_URL`.

The current phone-only login persists the returned RidePicker user locally. It
is an application session, not strong phone ownership verification. Real OTP can
still be added later behind the same auth interface.

---

## 5. Backend data access

The frontend no longer talks directly to Supabase. The Railway backend owns the
Supabase service-role connection and exposes user-facing HTTP endpoints. This
matches the database RLS posture where public anon access is not intended.

The adapters are implemented in `src/lib/services/api/` and share
`apiClient.js` for the API base URL, JSON errors and change notifications.

---

## 6. WhatsApp phone pairing

Phone-number pairing is the primary connection flow.

| Adapter operation | Backend mapping |
|---|---|
| `getSession(userId)` / `refreshSession(userId)` | `GET /api/users/:userId/whatsapp` |
| `startSession(userId)` | `POST /api/users/:userId/whatsapp/pairing-code` with `{}` |
| `refreshPairingCode(userId)` | same pairing-code endpoint |
| `refreshQr(userId)` | `POST /api/users/:userId/whatsapp/refresh-qr` (fallback only) |
| `disconnect(userId)` | `DELETE /api/users/:userId/whatsapp` |
| `retryReconnect(userId)` | `POST /api/users/:userId/whatsapp/reconnect` |

An empty pairing-code request body tells the backend to use the RidePicker
account phone. The UI therefore never asks the user to enter the number twice.

`ProductContext` polls about every 1.5s while `starting` or `reconnecting` and
about every 10s when connected. A temporary reconnect does not turn RidePicker
off.

---

## 7. WhatsApp session state shape

```js
{
  sessionId: "uuid",
  status: "starting" | "qr" | "connected" | "reconnecting" | "logged_out",
  account: { name, phone } | null,
  connectedAt: ISO8601 | null,
  pairingCode: {
    code,
    phone,
    issuedAt,
    displayExpiresAt
  } | null,
  qr: null | { /* backend fallback shape */ }
}
```

`WhatsappPairingCard` displays `pairingCode.code`, provides copy/regenerate
actions, and waits for polling to report `connected`. QR remains supported by
the backend only as a fallback and is not the normal user-facing flow.

---

## 8. Job data shape

```js
{
  id, pickup, dropoff, pickupTime (ISO8601),
  price (number | null),                // null = TBC
  status: "new"|"interested"|"contacted"|"negotiating"|"won"|"lost"|"ignored",
  paymentStatus: "paid"|"unpaid",
  paymentMethod: "cash"|"card"|"transfer"|"…",
  vehicle, passengers, flightNumber, source, sender,
  expenses: [{ id, category, amount, note }],
  timeline: [{ label, done, time }]
}
```

Job status and payment status are independent. `paymentStatus` and `status` are
both surfaced in the UI (PaymentChips / StatusBadge).

---

## 9. Activity data shape

```js
{ id, time (ISO8601), type: "job"|"message"|"ridepicker"|"whatsapp", title, detail }
```

Activity is appended by `ProductContext` on job/mode/WhatsApp lifecycle events.

---

## 10. Billing adapter location

`src/lib/services/billingService.js` → `src/lib/services/api/billingApi.js`.
The checkout URL comes from `config.paymentUrl` (`VITE_PAYMENT_URL`). Page
components call `billingService.getPaymentUrl()` and `activate/cancel/…`; they
never hardcode a provider.

**No fake checkout URL.** `VITE_PAYMENT_URL` has no built-in default. When it
is empty, `config.paymentUrl` is `""`, `billingService.getPaymentUrl()` returns
`""`, and the Billing page treats checkout as **not configured**: clicking
"Pay" shows a clear "Checkout not configured" message and does **not** navigate
to a fake URL. Mock billing (`activate`/`simulatePaymentFailure`/… via the dev
controls) still works in `VITE_DATA_MODE=mock`. Implement `billingApi.js` to
call your provider's checkout/subscription endpoints. `PLAN` and
`getPaymentUrl()` stay available even in the not-configured stub (they are not
fake user data).

---

## 11. Disabling development tools

Set `VITE_ENABLE_DEV_TOOLS=false`. Components read `config.enableDevTools` from
`src/lib/config.js` (never `import.meta.env` directly). Hidden controls:
- WhatsApp "simulate connection drop" / "reset session" (`WhatsappDemoControls`)
- Billing "mark as paid / fail / cancel / reset" (`Billing` demo panel)
- Settings "Reset development data"
- "Preview RidePicker with demo data" links (`DemoPreviewLink` + Jobs empty state)

In mock mode the seeded dev account still loads for development; that data path
is separate from the API path and never mixes into a real user session.

---

## 12. Base44 files/packages safe to remove after export

The runtime no longer calls any Base44 API — `AuthContext` and every other
runtime file read/write only through `src/lib/services/*` and `src/lib/config`.

> **Note on `AuthContext.jsx`:** while the project still lives in the Base44
> Builder, the platform marks `src/lib/AuthContext.jsx` as managed and *forces*
> the line `import { base44 } from '@/api/base44Client';` to remain. It is
> **unused** (no `base44.*` call exists) — the platform guard rejects edits that
> remove it. After export, delete that single import line (and the file
> `src/api/base44Client.js`) as part of the cleanup below; no other runtime code
> references it.

After export these can be removed without rewriting application logic:

- `@base44/vite-plugin` and the `base44({…})` block in `vite.config.js` (replace
  with plain `react()` plugin only).
- `@base44/sdk` dependency.
- `src/api/base44Client.js` (no longer imported by runtime code).
- `src/lib/app-params.js` (only used by the old Base44 bootstrap / OAuthConsent).
- `src/pages/OAuthConsent.jsx`, `src/pages/ForgotPassword.jsx`,
  `src/pages/ResetPassword.jsx` (removed; phone-only auth).
- `src/components/GoogleIcon.jsx` (Google login removed).
- Legacy service files already replaced by `src/lib/services/*`:
  `src/lib/auth/phoneAuthService.js`, `src/lib/billing/billingService.js`,
  `src/lib/whatsapp/whatsappSessionService.js`.
- The `base44/` directory (entities/functions/workflows/config) — unused by the
  standalone app.

After removing the vite plugin, run `npm run build` to confirm the bundle has
no Base44 imports. The app builds and runs with `VITE_DATA_MODE=mock` and no env.

---

## 13. Firebase Hosting

The exported project deploys as a Vite SPA to Firebase Hosting via
`firebase.json`. No Firebase project ID is hardcoded — configure it separately
with `firebase use` / `firebase init`.

- Build: `npm run build` outputs the static bundle to `dist/`.
- `firebase.json` sets `public: "dist"` and a single rewrite `** → /index.html`,
  so every app route (`/`, `/home`, `/jobs`, `/activity`, `/whatsapp`,
  `/settings`, `/billing`, `/learn-more`) resolves on direct open or refresh.
- `ignore` excludes `firebase.json`, dotfiles and `node_modules`.

Deploy:

```bash
npm run build
firebase deploy --only hosting
```

`npm run build` must succeed with `VITE_DATA_MODE=mock` and no env vars set.