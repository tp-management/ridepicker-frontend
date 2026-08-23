import { apiChanges, apiRequest, encoded } from "./apiClient";

export const activityApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener, "activity");
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
    apiChanges.notify({ scopes: ["activity"], reason: "local_activity_write" });
    return data?.entry || null;
  },

  async remove(userId, activityId) {
    if (!userId || activityId === null || activityId === undefined) return false;
    await apiRequest(
      `/api/users/${encoded(userId)}/activity/${encoded(activityId)}`,
      { method: "DELETE" }
    );
    apiChanges.notify({ scopes: ["activity"], reason: "local_activity_delete" });
    return true;
  },
};
