// Demo dataset used for the in-product "Preview with demo data" overlay.
// Reuses the dev seed builders so demo mode shows the same realistic
// jobs/activity (including payment + expenses) as the dev account.
import { buildJobs, buildActivity } from "@/lib/mock/devAccountSeed";

const ref = Date.now();
export const JOBS = buildJobs(ref);
export const ACTIVITY = buildActivity(ref);

export function getJobs() {
  return new Promise((resolve) => setTimeout(() => resolve(JOBS), 550));
}

export function getActivity() {
  return new Promise((resolve) => setTimeout(() => resolve(ACTIVITY), 500));
}