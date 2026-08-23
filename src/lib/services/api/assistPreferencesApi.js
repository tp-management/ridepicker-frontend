import { apiRequest, encoded } from "./apiClient";

const pathFor = (userId) => `/api/users/${encoded(userId)}/assist-preferences`;

export const assistPreferencesApi = {
  async get(userId) {
    const data = await apiRequest(pathFor(userId));
    return data?.assistPreferences || { keywords: [] };
  },

  async update(userId, keywords) {
    const data = await apiRequest(pathFor(userId), {
      method: "PUT",
      body: { keywords },
    });
    return data?.assistPreferences || { keywords: [] };
  },
};
