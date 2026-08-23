import { apiChanges, apiRequest, encoded } from "./apiClient";

const userPath = (userId) => `/api/users/${encoded(userId)}/jobs`;

export const jobsApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async list(userId) {
    const data = await apiRequest(userPath(userId));
    return data?.jobs || [];
  },

  async get(userId, jobId) {
    const data = await apiRequest(`${userPath(userId)}/${encoded(jobId)}`);
    return data?.job || null;
  },

  async updateStatus(userId, jobId, status) {
    const data = await apiRequest(`${userPath(userId)}/${encoded(jobId)}/status`, {
      method: "PATCH",
      body: { status },
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async updatePayment(userId, jobId, patch) {
    const data = await apiRequest(`${userPath(userId)}/${encoded(jobId)}/payment`, {
      method: "PATCH",
      body: patch,
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async addExpense(userId, jobId, expense) {
    const data = await apiRequest(`${userPath(userId)}/${encoded(jobId)}/expenses`, {
      method: "POST",
      body: expense,
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async removeExpense(userId, jobId, expenseId) {
    const data = await apiRequest(
      `${userPath(userId)}/${encoded(jobId)}/expenses/${encoded(expenseId)}`,
      { method: "DELETE" }
    );
    apiChanges.notify();
    return data?.job || null;
  },
};
