// Mock jobs service.
//
// All job reads/writes go through this interface. mockDataStore is the only
// module that touches storage. Replace with a Supabase adapter
// (src/lib/services/api/jobsApi.js) when VITE_DATA_MODE=api — the consuming
// pages and ProductContext stay unchanged.
//
// Job shape (see HANDOFF.md for the full schema): { id, pickup, dropoff,
// pickupTime, price, status, paymentStatus, paymentMethod, vehicle, passengers,
// flightNumber, source, sender, expenses[], timeline[] }.

import { mockDataStore } from "@/lib/mock/mockDataStore";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockJobsService = {
  subscribe(listener) {
    return mockDataStore.subscribe(listener);
  },

  /** List all jobs for the account. */
  async list(userId) {
    await delay(0);
    return mockDataStore.getUser(userId)?.jobs || [];
  },

  /** Get a single job. */
  async get(userId, jobId) {
    await delay(0);
    return (mockDataStore.getUser(userId)?.jobs || []).find((j) => j.id === jobId) || null;
  },

  /** Update a job's status (new/interested/contacted/negotiating/won/lost/ignored). */
  async updateStatus(userId, jobId, status) {
    await delay(50);
    return mockDataStore.updateJobStatus(userId, jobId, status);
  },

  /** Update payment fields (paymentStatus, paymentMethod). */
  async updatePayment(userId, jobId, patch) {
    await delay(50);
    return mockDataStore.updateJob(userId, jobId, patch);
  },

  /** Add an expense to a job. Returns the updated job. */
  async addExpense(userId, jobId, expense) {
    await delay(50);
    mockDataStore.addExpense(userId, jobId, expense);
    return (mockDataStore.getUser(userId)?.jobs || []).find((j) => j.id === jobId) || null;
  },

  /** Remove an expense from a job. Returns the updated job. */
  async removeExpense(userId, jobId, expenseId) {
    await delay(50);
    mockDataStore.removeExpense(userId, jobId, expenseId);
    return (mockDataStore.getUser(userId)?.jobs || []).find((j) => j.id === jobId) || null;
  },
};