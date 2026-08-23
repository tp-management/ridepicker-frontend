// Public jobsService facade.
//
// Selects the implementation from VITE_DATA_MODE (see config.js):
//   mock -> mockJobsService (localStorage)
//   api  -> jobsApi (RidePicker backend)
//
// Interface (async):
//   subscribe(listener) -> unsub
//   list(userId) -> Promise<Job[]>
//   get(userId, jobId) -> Promise<Job | null>
//   updateStatus(userId, jobId, status) -> Promise<Job>
//   updatePayment(userId, jobId, patch) -> Promise<Job>
//   addExpense(userId, jobId, expense) -> Promise<Job>
//   removeExpense(userId, jobId, expenseId) -> Promise<Job>
//
// API mode is wired to src/lib/services/api/jobsApi.js.

import { config } from "@/lib/config";
import { mockJobsService } from "./mock/mockJobsService";
import { jobsApi } from "./api/jobsApi";

export const jobsService =
  config.dataMode === "api" ? jobsApi : mockJobsService;
