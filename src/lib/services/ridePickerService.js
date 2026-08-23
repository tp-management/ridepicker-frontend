// Public ridePickerService facade.
//
// Selects the implementation from VITE_DATA_MODE (see config.js):
//   mock -> mockRidePickerService (localStorage)
//   api  -> ridePickerApi (RidePicker backend)
//
// Interface (async):
//   subscribe(listener) -> unsub
//   getState(userId) -> Promise<{ mode, botStartedAt }>
//   setMode(userId, mode, botStartedAt) -> Promise<state>
//
// Autopilot is blocked at the ProductContext/UI level — setMode here will accept
// any value, but ProductContext.setMode refuses "autopilot" until it ships.
//
// API mode is wired to src/lib/services/api/ridePickerApi.js.

import { config } from "@/lib/config";
import { mockRidePickerService } from "./mock/mockRidePickerService";
import { ridePickerApi } from "./api/ridePickerApi";

export const ridePickerService =
  config.dataMode === "api" ? ridePickerApi : mockRidePickerService;
