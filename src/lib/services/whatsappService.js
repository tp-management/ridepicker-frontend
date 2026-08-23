// Public whatsappService facade.
//
// Selects the implementation from VITE_DATA_MODE (see config.js):
//   mock -> mockWhatsappService (in-browser lifecycle simulator)
//   api  -> whatsappApi (RidePicker WhatsApp backend)
//
// The operations below are ADAPTER OPERATIONS, NOT direct HTTP endpoint names.
// The API adapter (src/lib/services/api/whatsappApi.js) is responsible for
// translating them into the actual RidePicker backend contract using only
// VITE_RIDEPICKER_API_URL as the base URL. Do NOT assume routes like
// DELETE /sessions/:id or POST /sessions/:id/qr here — those belong inside the
// adapter, which maps them to whatever the real backend exposes.
//
// Interface (async):
//   subscribe(listener) -> unsub
//   getSession(userId) -> Promise<session | null>      (initial load)
//   refreshSession(userId) -> Promise<session>         (polling)
//   startSession(userId) -> Promise<session>
//   refreshPairingCode(userId) -> Promise<session>
//   refreshQr(userId) -> Promise<session>       (fallback only)
//   disconnect(userId) -> Promise<session>
//   retryReconnect(userId) -> Promise<session>
//   simulateDrop(userId) -> Promise<session>           (dev tools only)
//
// Session shape (normalized for UI by the adapter):
//   { sessionId, status: "starting"|"qr"|"connected"|"reconnecting"|"logged_out",
//     account: { name, phone } | null, connectedAt, pairingCode: { code, phone,
//     issuedAt, displayExpiresAt } | null, qr: ... | null }
//
// The RidePicker user id is NOT the WhatsApp sessionId. The backend owns and
// returns sessionId. The primary UI uses phone-number pairing codes; QR remains
// available only as a backend/adapter fallback.
//
// API mode is wired to src/lib/services/api/whatsappApi.js.

import { config } from "@/lib/config";
import { mockWhatsappService } from "./mock/mockWhatsappService";
import { whatsappApi } from "./api/whatsappApi";

export const whatsappService =
  config.dataMode === "api" ? whatsappApi : mockWhatsappService;
