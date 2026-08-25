import { startOfWeek, startOfMonth } from "date-fns";

// Period definitions for the dashboard financial overview.
export const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

export function periodNoun(period) {
  if (period === "today") return "today";
  if (period === "week") return "this week";
  if (period === "month") return "this month";
  return "in total";
}

export function periodRange(period, ref = new Date()) {
  if (period === "today") {
    const s = new Date(ref);
    s.setHours(0, 0, 0, 0);
    const e = new Date(ref);
    e.setHours(23, 59, 59, 999);
    return { start: s, end: e };
  }
  if (period === "week") {
    const s = startOfWeek(ref, { weekStartsOn: 1 });
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return { start: s, end: e };
  }
  if (period === "month") {
    const s = startOfMonth(ref);
    const e = new Date(s);
    e.setMonth(s.getMonth() + 1);
    e.setMilliseconds(-1);
    return { start: s, end: e };
  }
  return { start: new Date(0), end: new Date(8.64e15) };
}

export function inPeriod(job, range) {
  const t = new Date(job.pickupTime);
  return t >= range.start && t <= range.end;
}

const WON = "won";
const COMPLETED = "completed";
const SECURED_STATUSES = new Set([WON, COMPLETED]);

function jobSecured(job) {
  return SECURED_STATUSES.has(job.status);
}

export function jobCompleted(job) {
  return job.status === COMPLETED;
}

export function jobUpcoming(job, ref = new Date()) {
  return job.status === WON && new Date(job.pickupTime) >= ref;
}

export function jobExpenses(job) {
  return (job.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

export function jobProfit(job) {
  const price = Number(job.price) || 0;
  return price - jobExpenses(job);
}

// Financial totals for the selected period. A completed job remains a secured
// job for revenue purposes, matching the database dashboard_summary semantics.
export function computeFinance(jobs, period, ref = new Date()) {
  const range = periodRange(period, ref);
  const secured = jobs.filter((j) => jobSecured(j) && inPeriod(j, range));
  const expected = secured.reduce((s, j) => s + (Number(j.price) || 0), 0);
  const received = secured
    .filter((j) => j.paymentStatus === "paid")
    .reduce((s, j) => s + (Number(j.price) || 0), 0);
  const outstanding = expected - received;
  const expenses = secured.reduce((s, j) => s + jobExpenses(j), 0);
  const net = received - expenses;
  return { expected, received, outstanding, expenses, net };
}

// Operational counts for the selected period. "Completed" is an explicit
// lifecycle status; a past pickup time alone does not rewrite job state.
export function computeOps(jobs, period, ref = new Date()) {
  const range = periodRange(period, ref);
  const secured = jobs.filter((j) => jobSecured(j) && inPeriod(j, range));
  const completed = secured.filter((j) => jobCompleted(j)).length;
  const upcoming = secured.filter((j) => jobUpcoming(j, ref)).length;
  return { jobsWon: secured.length, upcoming, completed };
}

// Intelligent "needs attention" alerts derived from real data.
// Each alert links to a filtered Jobs view. No fabricated alerts.
export function computeAttention(jobs) {
  const alerts = [];

  const completedUnpaid = jobs.filter((j) => jobCompleted(j) && j.paymentStatus !== "paid");
  if (completedUnpaid.length) {
    const total = completedUnpaid.reduce((s, j) => s + (Number(j.price) || 0), 0);
    alerts.push({
      key: "completed_unpaid",
      tone: "warning",
      title: `${completedUnpaid.length} completed ${completedUnpaid.length === 1 ? "job" : "jobs"} still unpaid`,
      value: `£${total}`,
      to: "/jobs?attention=completed_unpaid",
    });
  }

  const noPrice = jobs.filter(
    (j) => j.status !== "lost" && j.status !== "ignored" && !j.price && new Date(j.pickupTime) >= new Date()
  );
  if (noPrice.length) {
    alerts.push({
      key: "no_price",
      tone: "info",
      title: `${noPrice.length} upcoming ${noPrice.length === 1 ? "job has" : "jobs have"} no confirmed price`,
      value: "",
      to: "/jobs?attention=no_price",
    });
  }

  const waiting = jobs.filter((j) => j.status === "interested");
  if (waiting.length) {
    alerts.push({
      key: "waiting",
      tone: "info",
      title: `${waiting.length} ${waiting.length === 1 ? "job is" : "jobs are"} waiting for confirmation`,
      value: "",
      to: "/jobs?status=interested",
    });
  }

  const notContacted = jobs.filter((j) => j.status === "new");
  if (notContacted.length) {
    alerts.push({
      key: "new",
      tone: "info",
      title: `${notContacted.length} new ${notContacted.length === 1 ? "job" : "jobs"} not yet contacted`,
      value: "",
      to: "/jobs?status=new",
    });
  }

  return alerts;
}

// Concise insight summary interpreting the account's data.
export function computeSummary(jobs, period, ref = new Date()) {
  if (!jobs.length) {
    return "No jobs detected yet. Connect WhatsApp and turn on RidePicker to start monitoring.";
  }
  const range = periodRange(period, ref);
  const secured = jobs.filter((j) => jobSecured(j) && inPeriod(j, range));
  const noun = periodNoun(period);
  if (!secured.length) {
    return `No jobs secured ${noun} yet. ${jobs.length} job${jobs.length === 1 ? "" : "s"} detected and being worked.`;
  }
  const value = secured.reduce((s, j) => s + (Number(j.price) || 0), 0);
  const outstanding = secured
    .filter((j) => j.paymentStatus !== "paid")
    .reduce((s, j) => s + (Number(j.price) || 0), 0);

  const tStart = new Date(ref);
  tStart.setDate(tStart.getDate() + 1);
  tStart.setHours(0, 0, 0, 0);
  const tEnd = new Date(tStart);
  tEnd.setHours(23, 59, 59, 999);
  const tomorrowWon = secured.filter((j) => {
    if (j.status !== WON) return false;
    const t = new Date(j.pickupTime);
    return t >= tStart && t <= tEnd;
  });

  const parts = [`You secured ${secured.length} ${secured.length === 1 ? "job" : "jobs"} ${noun} worth £${value}.`];
  if (outstanding > 0) parts.push(`£${outstanding} is still outstanding.`);
  if (tomorrowWon.length) {
    const earliest = tomorrowWon.map((j) => new Date(j.pickupTime)).sort((a, b) => a - b)[0];
    const hh = String(earliest.getHours()).padStart(2, "0");
    const mm = String(earliest.getMinutes()).padStart(2, "0");
    parts.push(`Tomorrow you have ${tomorrowWon.length} confirmed ${tomorrowWon.length === 1 ? "job" : "jobs"} starting at ${hh}:${mm}.`);
  }
  return parts.join(" ");
}
