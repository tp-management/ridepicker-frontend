const STORAGE_PREFIX = "ridepicker_assist_preferences_v1:";

const listeners = new Set();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function storageKey(userId) {
  return `${STORAGE_PREFIX}${String(userId || "anonymous")}`;
}

function readKeywords(userId) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(userId)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeKeywords(userId, keywords) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(keywords));
}

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // One mock subscriber must not break another.
    }
  });
}

export const mockAssistPreferencesService = {
  subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async get(userId) {
    await delay(0);
    return { keywords: readKeywords(userId) };
  },

  async update(userId, keywords) {
    await delay(80);
    writeKeywords(userId, keywords);
    notify();
    return { keywords: readKeywords(userId) };
  },
};
