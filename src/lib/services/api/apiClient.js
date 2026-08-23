import { config } from "@/lib/config";

function apiBase() {
  const base = String(config.ridePickerApiUrl || "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("RidePicker API URL is not configured. Set VITE_RIDEPICKER_API_URL.");
  }
  return base;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, signal } = options;
  const response = await fetch(`${apiBase()}${path}`, {
    method,
    signal,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `RidePicker API request failed (${response.status})`);
    error.status = response.status;
    error.details = payload?.details;
    throw error;
  }

  return payload;
}

export function encoded(value) {
  return encodeURIComponent(String(value));
}

export function createChangeEmitter() {
  const listeners = new Set();
  return {
    subscribe(listener) {
      if (typeof listener !== "function") return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify() {
      listeners.forEach((listener) => {
        try {
          listener();
        } catch {
          // A subscriber should never break the service that triggered it.
        }
      });
    },
  };
}

export const apiChanges = createChangeEmitter();
