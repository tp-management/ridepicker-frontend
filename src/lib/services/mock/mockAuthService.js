// Mock authentication service.
//
// RidePicker authentication is phone-based (no passwords, no Google). This is
// the CURRENT development auth implementation — phone-only lookup is NOT final
// production security. Real phone verification/OTP can be introduced behind
// this same interface (openExistingAccount -> verify, signUp -> verify)
// without redesigning the auth screens.
//
// mockDataStore is the ONLY module imported here; nothing else in the app
// touches the store for auth. Replace this implementation with a Supabase
// adapter (src/lib/services/api/authApi.js) when VITE_DATA_MODE=api.

import { mockDataStore } from "@/lib/mock/mockDataStore";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockAuthService = {
  /** Subscribe to session/data changes. Returns an unsubscribe fn. */
  subscribe(listener) {
    return mockDataStore.subscribe(listener);
  },

  /** Restore an existing session, if any. Resolves { user, provider, createdAt } | null. */
  async getSession() {
    await delay(0);
    const userId = mockDataStore.getSessionUserId();
    if (!userId) return null;
    const user = mockDataStore.getUser(userId);
    if (!user) return null;
    return { user, provider: "phone", createdAt: user.createdAt };
  },

  /** End the current session (logout). */
  clearSession() {
    mockDataStore.clearSession();
  },
  logout() {
    mockDataStore.clearSession();
  },

  /** Look up a registered RidePicker user by phone. Resolves user | null. */
  async lookupByPhone(phone) {
    await delay(0);
    return mockDataStore.getUserByPhone(phone);
  },

  /** Is the given user the seeded development account? */
  isDevUser(user) {
    return mockDataStore.isDevUser(user);
  },

  /** Reset the development account to its seeded state (dev tools only). */
  resetDevAccount() {
    return mockDataStore.resetDevAccount();
  },

  /** Open an existing account (login). Resolves to { status: "authenticated" | "not_found", user? }. */
  async openExistingAccount(phone) {
    await delay(500);
    const user = mockDataStore.getUserByPhone(phone);
    if (!user) return { status: "not_found" };
    mockDataStore.setSession(user.id);
    return { status: "authenticated", user };
  },

  /** Create a new RidePicker account. Resolves to { status: "authenticated", user }. */
  async signUp({ name, phone }) {
    await delay(600);
    const user = mockDataStore.createUser({ name, phone });
    mockDataStore.setSession(user.id);
    return { status: "authenticated", user };
  },
};