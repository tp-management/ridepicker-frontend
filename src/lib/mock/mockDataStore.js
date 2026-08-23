// Centralized mock data layer for RidePicker development.
//
// This is the SINGLE source of truth for all per-user application state while
// the real backend is not connected. The UI never reads mock data directly
// from pages/components — it goes through the domain services
// (phoneAuthService, billingService, whatsappSessionService, ProductContext)
// which all read from / write to this store.
//
// Replace later without touching the UI:
//   mock users      -> Supabase Auth users
//   mock jobs       -> Supabase
//   mock activity   -> Supabase
//   mock whatsapp   -> RidePicker Railway API
//   mock billing    -> real payment provider
//
// All state persists to localStorage so it survives navigation and refresh.

import { buildDevUser, DEV_PHONE, DEV_ID } from "@/lib/mock/devAccountSeed";

export { DEV_PHONE };

const STORE_KEY = "ridepicker_store_v2";
const SESSION_KEY = "ridepicker_session_v1";

export const normPhone = (p) => (p || "").replace(/\D/g, "");

const listeners = new Set();
const notify = () => listeners.forEach((l) => l());

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch {
    return null;
  }
};
const persist = (store) => localStorage.setItem(STORE_KEY, JSON.stringify(store));
const commit = (store) => {
  persist(store);
  notify();
};
const ensureSeeded = () => {
  let s = read();
  if (!s || !s.users) {
    s = { users: { [DEV_ID]: buildDevUser() }, version: 1 };
    persist(s);
    return s;
  }
  // Guarantee the canonical development account is always present and
  // complete. A store from an earlier seed/version may be missing it, hold
  // an incomplete copy, or contain a stale duplicate user created by a
  // sign-up that happened before the seed existed — any of which would make
  // the dev number resolve to an account with no jobs.
  let changed = false;
  const dev = s.users[DEV_ID];
  if (!dev || !Array.isArray(dev.jobs) || dev.jobs.length === 0) {
    s.users[DEV_ID] = buildDevUser();
    changed = true;
  }
  const devPhone = normPhone(DEV_PHONE);
  for (const id of Object.keys(s.users)) {
    if (id === DEV_ID) continue;
    if (normPhone(s.users[id]?.phone) === devPhone) {
      delete s.users[id];
      changed = true;
    }
  }
  if (changed) persist(s);
  return s;
};

function buildNewUser({ name, phone }) {
  const now = new Date().toISOString();
  const cleanName = (name || "").trim() || "New user";
  const cleanPhone = (phone || "").trim();
  return {
    id: "usr_" + normPhone(phone).slice(0, 12) + "_" + Date.now().toString(36),
    full_name: cleanName,
    name: cleanName,
    phone: cleanPhone,
    email: "",
    createdAt: now,
    profile: { name: cleanName, phone: cleanPhone, email: "" },
    // New users start empty: no subscription (payment required per onboarding),
    // no WhatsApp, RidePicker OFF, no jobs, only an account-creation activity.
    subscription: null,
    whatsapp: null,
    ridepicker: { mode: "off", botStartedAt: null },
    jobs: [],
    activity: [{ id: `act_${Date.now()}`, type: "ridepicker", title: "Account created", detail: "", time: now }],
  };
}

export const mockDataStore = {
  normPhone,

  isDevUser(user) {
    return !!user && normPhone(user.phone) === normPhone(DEV_PHONE);
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // ---- Session ----
  getSessionUserId() {
    return localStorage.getItem(SESSION_KEY);
  },
  setSession(userId) {
    localStorage.setItem(SESSION_KEY, userId);
    notify();
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    notify();
  },

  // ---- Users ----
  getUser(userId) {
    if (!userId) return null;
    return ensureSeeded().users[userId] || null;
  },
  getUserByPhone(phone) {
    const n = normPhone(phone);
    if (!n) return null;
    // The development account is canonical for its phone number: always
    // resolve to it, even if a stale duplicate exists in the store.
    if (n === normPhone(DEV_PHONE)) {
      return ensureSeeded().users[DEV_ID] || null;
    }
    return Object.values(ensureSeeded().users).find((u) => normPhone(u.phone) === n) || null;
  },
  createUser({ name, phone }) {
    const s = ensureSeeded();
    const user = buildNewUser({ name, phone });
    s.users[user.id] = user;
    commit(s);
    return user;
  },

  setProfile(userId, profile) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return null;
    const p = { ...u.profile, ...profile };
    u.profile = p;
    if (profile.name !== undefined) {
      u.full_name = profile.name;
      u.name = profile.name;
    }
    if (profile.email !== undefined) u.email = profile.email;
    if (profile.phone !== undefined) u.phone = profile.phone;
    commit(s);
    return u;
  },

  // ---- Slices ----
  setSubscription(userId, sub) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return;
    u.subscription = sub;
    commit(s);
  },

  setWhatsapp(userId, wa) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return;
    u.whatsapp = wa;
    commit(s);
  },

  setRidePicker(userId, rp) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return;
    u.ridepicker = { ...u.ridepicker, ...rp };
    commit(s);
  },

  updateJobStatus(userId, jobId, status) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return null;
    const job = (u.jobs || []).find((j) => j.id === jobId);
    if (!job) return null;
    const nextTimeline = job.timeline
      ? job.timeline.map((step, i) =>
          i === job.timeline.length - 1 && status === "won"
            ? { ...step, done: true, time: new Date().toISOString() }
            : step
        )
      : job.timeline;
    u.jobs = u.jobs.map((j) => (j.id === jobId ? { ...j, status, timeline: nextTimeline } : j));
    commit(s);
    return u.jobs.find((j) => j.id === jobId);
  },

  // Generic job patch (payment, etc.)
  updateJob(userId, jobId, patch) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return null;
    u.jobs = (u.jobs || []).map((j) => (j.id === jobId ? { ...j, ...patch } : j));
    commit(s);
    return u.jobs.find((j) => j.id === jobId);
  },

  addExpense(userId, jobId, expense) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return;
    u.jobs = (u.jobs || []).map((j) =>
      j.id === jobId ? { ...j, expenses: [...(j.expenses || []), expense] } : j
    );
    commit(s);
  },

  removeExpense(userId, jobId, expenseId) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return;
    u.jobs = (u.jobs || []).map((j) =>
      j.id === jobId ? { ...j, expenses: (j.expenses || []).filter((e) => e.id !== expenseId) } : j
    );
    commit(s);
  },

  addActivity(userId, entry) {
    const s = ensureSeeded();
    const u = s.users[userId];
    if (!u) return;
    u.activity = [entry, ...(u.activity || [])];
    commit(s);
  },

  // ---- Dev reset ----
  resetDevAccount() {
    const s = ensureSeeded();
    s.users[DEV_ID] = buildDevUser();
    commit(s);
    return s.users[DEV_ID];
  },

  resetAll() {
    const s = { users: { [DEV_ID]: buildDevUser() }, version: 1 };
    commit(s);
    return s;
  },
};