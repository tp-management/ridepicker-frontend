# WhatsApp pairing update

## What changed

- Replaced the normal QR connection screen with WhatsApp phone-number pairing.
- The frontend does not ask for a second phone number. It uses the RidePicker account already returned by login.
- `startSession(userId)` calls `POST /api/users/:userId/whatsapp/pairing-code` with an empty body.
- The UI displays `session.pairingCode.code`, supports copy/regenerate, and polls until the backend reports `connected`.
- QR endpoints remain adapter/backend fallback operations, but the standard WhatsApp page no longer renders a QR code.
- Mock mode now mirrors the pairing-code lifecycle for safe UI development.

## Real API mode

The API adapters in `src/lib/services/api/` are wired to the current RidePicker backend for:

- account login/sign-up
- profile
- jobs and expenses
- activity
- RidePicker mode
- WhatsApp
- billing state

All real adapters use one public frontend setting:

```env
VITE_DATA_MODE=api
VITE_RIDEPICKER_API_URL=https://your-ridepicker-backend.example.com
VITE_ENABLE_DEV_TOOLS=false
```

`VITE_PAYMENT_URL` remains optional until checkout/payment management is configured.

Do not put Supabase service-role or internal API keys in the frontend.

## Expected WhatsApp flow

1. User logs into RidePicker with their phone number.
2. User opens the WhatsApp page and clicks **Generate connection code**.
3. Backend uses the account phone and asks Baileys for a pairing code.
4. User opens WhatsApp → Linked Devices → Link a device → Link with phone number.
5. User enters the displayed code.
6. Frontend polling detects `connected` and switches to the connected account card automatically.
