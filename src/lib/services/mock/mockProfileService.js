// Mock profile service.
//
// The profile is stored on the user record. Pages read the user from
// AuthContext; profile writes go through this service so the persistence layer
// stays swappable. Replace with a Supabase adapter when VITE_DATA_MODE=api.

import { mockDataStore } from "@/lib/mock/mockDataStore";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockProfileService = {
  subscribe(listener) {
    return mockDataStore.subscribe(listener);
  },
  async get(userId) {
    await delay(0);
    const u = mockDataStore.getUser(userId);
    return u ? u.profile : null;
  },
  async update(userId, profile) {
    await delay(0);
    return mockDataStore.setProfile(userId, profile);
  },
};