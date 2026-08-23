import { apiChanges, apiRequest, encoded } from "./apiClient";

const pathFor = (userId) => `/api/users/${encoded(userId)}/preferences`;

export const preferencesApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener, "preferences");
  },

  async get(userId) {
    const data = await apiRequest(pathFor(userId));
    return data?.preferences || null;
  },

  async update(userId, patch) {
    const data = await apiRequest(pathFor(userId), {
      method: "PATCH",
      body: patch,
    });
    apiChanges.notify({ scopes: ["preferences"], reason: "local_preferences_write" });
    return data?.preferences || null;
  },
};
