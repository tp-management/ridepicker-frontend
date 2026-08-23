# RidePicker

An intelligent AI dispatch dashboard that monitors WhatsApp conversations to
detect, organize, and manage chauffeur / taxi job opportunities.

This repository is a standalone **React + Vite** app. It runs with no backend in
**mock mode**, and can switch to the real RidePicker Railway backend with environment
variables, without rewriting pages.

See **[HANDOFF.md](./HANDOFF.md)** for the full architecture, service interfaces,
data shapes, and where to connect each backend.

---

## Quick start (standalone)

```bash
npm install
npm run dev      # start the Vite dev server (mock mode by default)
npm run build    # production build
npm run preview  # preview the production build
```

Open the local URL Vite prints. No backend, database, or account is required in
mock mode.

---

## Data mode

RidePicker selects its data layer from `VITE_DATA_MODE` (read once in
`src/lib/config.js`):

### Mock mode — `VITE_DATA_MODE=mock` (default)

Runs entirely on an in-browser `localStorage` store. No backend, no auth server,
no secrets. The seeded development account **+37067837730** loads with demo jobs,
activity and an active subscription. Any other phone number starts an empty
onboarding account. Use this for development, demos, and previews.

Create `.env.local` (copy from `.env.example`):

```bash
VITE_DATA_MODE=mock
VITE_ENABLE_DEV_TOOLS=false
```

### API mode — `VITE_DATA_MODE=api`

Routes the service layer to the implemented adapters in `src/lib/services/api/*`.
They all call the RidePicker Railway backend, which owns Supabase access and the
Baileys WhatsApp session. The frontend never receives a Supabase service-role key.

```bash
VITE_DATA_MODE=api
VITE_RIDEPICKER_API_URL=https://your-ridepicker-backend.example.com
VITE_PAYMENT_URL=https://your-checkout.example.com
VITE_ENABLE_DEV_TOOLS=false
```

WhatsApp connection uses phone-number pairing by default. The frontend asks the
backend for a pairing code, displays it, and polls until the session is connected.
The backend uses the RidePicker login phone automatically, so the user does not
enter the phone number twice.

Never put a Supabase service_role key or backend secret in frontend env.

---

## Development tools

`VITE_ENABLE_DEV_TOOLS=true` shows controls that simulate state for previewing:
a WhatsApp connection-drop simulator, mock billing buttons, "reset development
data", and "preview with demo data" links. Keep this `false` for any real build.

---

## Project structure (summary)

```
src/
  lib/
    config.js                single place that reads env vars
    AuthContext.jsx          phone-only auth (no Base44 runtime dependency)
    product/ProductContext.jsx   central state, async service calls, loading states
    services/                public facades (mock/api selected by VITE_DATA_MODE)
      notConfigured.js       legacy controlled stub helper
      mock/                  mock implementations (only place that imports mockDataStore)
      api/                   real RidePicker backend adapters
  pages/ …                   approved UI — unchanged when switching backend
```

---

## Base44 Builder development

This project can also be developed and published through the Base44 Builder.
That workflow is separate from the standalone workflow above.

1. Install dependencies: `npm install`.
2. Install the Base44 CLI: `npm install -g base44@latest`.
3. Run the full Base44 environment: `base44 dev` (starts the local Base44 backend
   and, when configured, the frontend dev server).
4. Or run only the frontend against the hosted backend: `npm run dev`.
5. Publish from the Base44 dashboard: `base44 dashboard open`.

The Base44 Vite plugin (`@base44/vite-plugin`) and `@base44/sdk` are present
only while the project lives in the Builder. The standalone app runtime does
not depend on them; after export they (and `src/api/base44Client.js`, `base44/`)
can be removed — see HANDOFF.md §12.

Docs: https://docs.base44.com · Support: https://app.base44.com/support