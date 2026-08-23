// Public profileService facade.
//
// Selects the implementation from VITE_DATA_MODE (see config.js):
//   mock -> mockProfileService (localStorage)
//   api  -> profileApi (RidePicker backend)
//
// Interface (async):
//   subscribe(listener) -> unsub
//   get(userId) -> Promise<profile | null>
//   update(userId, profile) -> Promise<updatedUser | null>
//
// API mode is wired to src/lib/services/api/profileApi.js.

import { config } from "@/lib/config";
import { mockProfileService } from "./mock/mockProfileService";
import { profileApi } from "./api/profileApi";

export const profileService =
  config.dataMode === "api" ? profileApi : mockProfileService;
