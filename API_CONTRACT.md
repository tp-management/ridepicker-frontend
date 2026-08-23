# RidePicker frontend API contract

`VITE_DATA_MODE=api` uses only `VITE_RIDEPICKER_API_URL`. The browser never receives Supabase service-role credentials.

## Current adapter coverage

| Frontend adapter | Backend resource |
| --- | --- |
| `authApi` | users / phone account lookup and creation |
| `profileApi` | user profile |
| `preferencesApi` | driver preferences |
| `jobsApi` | jobs, linked messages and expenses |
| `activityApi` | activity timeline, including persisted WhatsApp messages |
| `ridePickerApi` | RidePicker mode |
| `whatsappApi` | WhatsApp session, pairing, chats and messages |
| `billingApi` | subscription and invoices |
| `dashboardApi` | dashboard summary |

## Message visibility

The existing Activity page already renders `type: "message"` entries and has a Messages filter. In API mode, `GET /api/users/:userId/activity` is therefore the timeline feed used by that page. The backend merges persisted `messages` rows into this response.

For a dedicated chat/message view, `whatsappApi` additionally exposes:

- `listChats(userId, options)`
- `listMessages(userId, options)`
- `getMessage(userId, messageId)`
- `sendMessage(userId, chatId, text)`

## Jobs

`jobsApi` exposes the complete database-backed user surface:

- list/get/create/update/remove
- status update
- payment update
- linked WhatsApp messages
- expense list/add/update/remove

## Deliberately private backend data

The frontend has no adapter for `whatsapp_auth` or `system_logs`. They are backend-only credential/diagnostic data and must not be exposed to the browser.

## Security blocker

The current phone session is still application-local identity. The backend's current user guard proves only that the requested user exists. Supabase Auth/JWT identity + ownership enforcement is a separate required security step before production-security signoff. Do not put service-role credentials or a shared secret API key in the frontend as a substitute.

## Billing

Subscription/invoice reads are backed by Supabase. Checkout/payment provider actions remain provider-dependent. If `VITE_PAYMENT_URL` is not configured the UI must continue reporting checkout as not configured; it must not fabricate payment URLs or payment success.
