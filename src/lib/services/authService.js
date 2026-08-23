// Public authService facade.
//
// Selects the implementation from the centralized config (VITE_DATA_MODE):
//   mock -> mockAuthService (local development only)
//   api  -> authApi (Supabase phone OTP + RidePicker backend ownership)
//
// API mode never treats a phone number or localStorage user object as proof of
// identity. Supabase issues the bearer session after OTP verification, and the
// backend maps that auth subject to exactly one RidePicker user row.

import { config } from "@/lib/config";
import { mockAuthService } from "./mock/mockAuthService";
import { authApi } from "./api/authApi";

export const authService =
  config.dataMode === "api"
    ? authApi
    : mockAuthService;
