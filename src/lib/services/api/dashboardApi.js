import { apiRequest, encoded } from "./apiClient";

export const dashboardApi = {
  async getSummary(userId) {
    const data = await apiRequest(`/api/users/${encoded(userId)}/dashboard`);
    return data?.summary || null;
  },
};
