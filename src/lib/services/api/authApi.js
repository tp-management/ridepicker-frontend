import { apiChanges, apiRequest, encoded } from "./apiClient";

const SESSION_KEY = "ridepicker_api_session_v1";

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user?.id ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(user) {
  const session = {
    user,
    provider: "phone",
    createdAt: user?.createdAt || new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // The in-memory auth state still works for the current tab.
  }
  apiChanges.notify();
  return session;
}

function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage failures
  }
  apiChanges.notify();
}

async function lookup(phone) {
  const data = await apiRequest(`/api/users/by-phone/${encoded(phone)}`);
  return data?.user || null;
}

export const authApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async getSession() {
    const stored = readSession();
    if (!stored?.user?.id) return null;

    try {
      const data = await apiRequest(`/api/users/${encoded(stored.user.id)}`);
      if (data?.user) return writeSession(data.user);
      return stored;
    } catch (error) {
      if (error?.status === 404) {
        clearStoredSession();
        return null;
      }
      // Keep the local session through temporary backend/network outages.
      return stored;
    }
  },

  clearSession() {
    clearStoredSession();
  },

  logout() {
    clearStoredSession();
  },

  async lookupByPhone(phone) {
    return lookup(phone);
  },

  isDevUser() {
    return false;
  },

  resetDevAccount() {
    return null;
  },

  async openExistingAccount(phone) {
    try {
      const user = await lookup(phone);
      if (!user) return { status: "not_found" };
      writeSession(user);
      return { status: "authenticated", user };
    } catch (error) {
      return {
        status: "error",
        message: error?.message || "Could not connect to RidePicker.",
      };
    }
  },

  async signUp({ name, phone }) {
    try {
      const data = await apiRequest("/api/users", {
        method: "POST",
        body: { name, phone },
      });
      const user = data?.user;
      if (!user) {
        return { status: "error", message: "RidePicker did not return the new account." };
      }
      writeSession(user);
      return { status: "authenticated", user };
    } catch (error) {
      return {
        status: "error",
        message: error?.message || "Could not create account.",
      };
    }
  },
};
