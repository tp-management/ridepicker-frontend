import { apiChanges, apiRequest, encoded } from "./apiClient";


export const activityApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async list(userId) {
    const data = await apiRequest(`/api/users/${encoded(userId)}/activity`);
    return data?.activity || [];
  },

  async add(userId, entry) {
    if (!userId) return null;
    const data = await apiRequest(`/api/users/${encoded(userId)}/activity`, {
      method: "POST",
      body: entry,
    });
    apiChanges.notify();
    return data?.entry || null;
  },
};
