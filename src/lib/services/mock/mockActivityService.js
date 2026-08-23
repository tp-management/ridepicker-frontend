// Mock activity service.
//
// Activity is the timeline of what RidePicker has been doing. Writes are
// appended by ProductContext (job status changes, mode changes, WhatsApp
// lifecycle). Replace with a Supabase adapter when VITE_DATA_MODE=api.
//
// Activity shape: { id, time, type: "job"|"message"|"ridepicker"|"whatsapp",
// title, detail }.

import { mockDataStore } from "@/lib/mock/mockDataStore";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockActivityService = {
  subscribe(listener) {
    return mockDataStore.subscribe(listener);
  },
  async list(userId) {
    await delay(0);
    return mockDataStore.getUser(userId)?.activity || [];
  },
  async add(userId, entry) {
    await delay(0);
    mockDataStore.addActivity(userId, entry);
    return entry;
  },
};