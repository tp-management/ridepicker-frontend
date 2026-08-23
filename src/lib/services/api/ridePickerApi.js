import { apiChanges, apiRequest, encoded } from "./apiClient";


export const ridePickerApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async getState(userId) {
    return apiRequest(`/api/users/${encoded(userId)}/ridepicker`);
  },

  async setMode(userId, mode) {
    const state = await apiRequest(`/api/users/${encoded(userId)}/ridepicker`, {
      method: "PUT",
      body: { mode },
    });
    apiChanges.notify();
    return state;
  },
};
