// Mock RidePicker mode/state service.
//
// RidePicker mode: "off" | "assist" | "autopilot". Autopilot is NOT available
// yet (blocked in the UI and in ProductContext.setMode). Monitoring (Assist)
// requires a connected WhatsApp account and an active subscription — those
// gates live in ProductContext, not here. Replace with an adapter when
// VITE_DATA_MODE=api.

import { mockDataStore } from "@/lib/mock/mockDataStore";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockRidePickerService = {
  subscribe(listener) {
    return mockDataStore.subscribe(listener);
  },
  /** Current mode + when monitoring started. Resolves { mode, botStartedAt }. */
  async getState(userId) {
    await delay(0);
    const u = mockDataStore.getUser(userId);
    return { mode: u?.ridepicker?.mode || "off", botStartedAt: u?.ridepicker?.botStartedAt || null };
  },
  /** Persist the mode (and botStartedAt). */
  async setMode(userId, mode, botStartedAt) {
    await delay(40);
    mockDataStore.setRidePicker(userId, { mode, botStartedAt });
    return mockRidePickerService.getState(userId);
  },
};