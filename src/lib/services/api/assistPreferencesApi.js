import { apiChanges, apiRequest, encoded } from "./apiClient";

const pathFor = (userId) => `/api/users/${encoded(userId)}/assist-preferences`;

export const assistPreferencesApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async get(userId) {
    const data = await apiRequest(pathFor(userId));
    return data?.assistPreferences || { keywords: [] };
  },

  async update(userId, keywords) {
    const data = await apiRequest(pathFor(userId), {
      method: "PUT",
      body: { keywords },
    });
    apiChanges.notify();
    return data?.assistPreferences || { keywords: [] };
  },
};
