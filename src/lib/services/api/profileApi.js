import { apiChanges, apiRequest, encoded } from "./apiClient";

export const profileApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener, "profile");
  },

  async get(userId) {
    const data = await apiRequest(`/api/users/${encoded(userId)}/profile`);
    return data?.profile || null;
  },

  async update(userId, profile) {
    const data = await apiRequest(`/api/users/${encoded(userId)}/profile`, {
      method: "PATCH",
      body: profile,
    });
    return data?.user || null;
  },
};
