import { apiChanges, apiRequest, encoded } from "./apiClient";

const userPath = (userId) => `/api/users/${encoded(userId)}/jobs`;
const jobPath = (userId, jobId) => `${userPath(userId)}/${encoded(jobId)}`;

export const jobsApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async list(userId) {
    const data = await apiRequest(userPath(userId));
    return data?.jobs || [];
  },

  async get(userId, jobId) {
    const data = await apiRequest(jobPath(userId, jobId));
    return data?.job || null;
  },

  async create(userId, input) {
    const data = await apiRequest(userPath(userId), {
      method: "POST",
      body: input,
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async update(userId, jobId, patch) {
    const data = await apiRequest(jobPath(userId, jobId), {
      method: "PATCH",
      body: patch,
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async remove(userId, jobId) {
    const data = await apiRequest(jobPath(userId, jobId), {
      method: "DELETE",
    });
    apiChanges.notify();
    return Boolean(data?.ok);
  },

  async updateStatus(userId, jobId, status) {
    const data = await apiRequest(`${jobPath(userId, jobId)}/status`, {
      method: "PATCH",
      body: { status },
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async updatePayment(userId, jobId, patch) {
    const data = await apiRequest(`${jobPath(userId, jobId)}/payment`, {
      method: "PATCH",
      body: patch,
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async listMessages(userId, jobId) {
    const data = await apiRequest(`${jobPath(userId, jobId)}/messages`);
    return data?.messages || [];
  },

  async listExpenses(userId, jobId) {
    const data = await apiRequest(`${jobPath(userId, jobId)}/expenses`);
    return data?.expenses || [];
  },

  async addExpense(userId, jobId, expense) {
    const data = await apiRequest(`${jobPath(userId, jobId)}/expenses`, {
      method: "POST",
      body: expense,
    });
    apiChanges.notify();
    return data?.job || null;
  },

  async updateExpense(userId, jobId, expenseId, patch) {
    const data = await apiRequest(
      `${jobPath(userId, jobId)}/expenses/${encoded(expenseId)}`,
      {
        method: "PATCH",
        body: patch,
      }
    );
    apiChanges.notify();
    return data?.job || null;
  },

  async removeExpense(userId, jobId, expenseId) {
    const data = await apiRequest(
      `${jobPath(userId, jobId)}/expenses/${encoded(expenseId)}`,
      { method: "DELETE" }
    );
    apiChanges.notify();
    return data?.job || null;
  },
};
