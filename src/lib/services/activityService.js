// Public activityService facade.
//
// Selects the implementation from VITE_DATA_MODE (see config.js):
//   mock -> mockActivityService (localStorage)
//   api  -> activityApi (RidePicker backend)
//
// Interface (async):
//   subscribe(listener) -> unsub
//   list(userId) -> Promise<Activity[]>
//   add(userId, entry) -> Promise<entry>
//
// API mode is wired to src/lib/services/api/activityApi.js.

import { config } from "@/lib/config";
import { mockActivityService } from "./mock/mockActivityService";
import { activityApi } from "./api/activityApi";

export const activityService =
  config.dataMode === "api" ? activityApi : mockActivityService;
