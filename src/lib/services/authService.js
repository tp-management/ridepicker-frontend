// Public authService facade.
//
// Selects the implementation from the centralized config (VITE_DATA_MODE):
//   mock -> mockAuthService (in-browser localStorage store)
//   api  -> authApi (RidePicker backend account API)
//
// In API mode, authApi uses the RidePicker backend and persists the current
// phone session locally until real OTP verification is introduced.
//
// Interface (all data reads/writes are async so a real backend can drop in):
//   subscribe(listener) -> unsub
//   getSession() -> Promise<{ user, provider, createdAt } | null>
//   clearSession() / logout()
//   lookupByPhone(phone) -> Promise<user | null>
//   isDevUser(user) -> bool
//   resetDevAccount() -> devUser               (dev tools only)
//   openExistingAccount(phone) -> Promise<{ status, user? }>
//   signUp({ name, phone }) -> Promise<{ status, user }>
//
// API mode is wired to src/lib/services/api/authApi.js.

import { config } from "@/lib/config";
import { mockAuthService } from "./mock/mockAuthService";
import { authApi } from "./api/authApi";

export const authService =
  config.dataMode === "api"
    ? authApi
    : mockAuthService;
