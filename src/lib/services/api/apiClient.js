import { config } from "@/lib/config";

function apiBase() {
  const base = String(config.ridePickerApiUrl || "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("RidePicker API URL is not configured. Set VITE_RIDEPICKER_API_URL.");
  }
  return base;
}

export function apiUrl(path = "") {
  return `${apiBase()}${path}`;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, signal } = options;
  const response = await fetch(apiUrl(path), {
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

function normalizeChange(change) {
  if (!change || !Array.isArray(change.scopes) || !change.scopes.length) {
    return { ...(change || {}), scopes: ["all"] };
  }
  return {
    ...change,
    scopes: [...new Set(change.scopes.map((scope) => String(scope || "").trim()).filter(Boolean))],
  };
}

export function createChangeEmitter() {
  const listeners = new Set();

  return {
    subscribe(listener, scopes = null) {
      if (typeof listener !== "function") return () => {};
      const wanted = scopes
        ? new Set((Array.isArray(scopes) ? scopes : [scopes]).map(String))
        : null;
      const entry = { listener, wanted };
      listeners.add(entry);
      return () => listeners.delete(entry);
    },

    notify(change = null) {
      const normalized = normalizeChange(change);
      const changed = new Set(normalized.scopes);

      listeners.forEach(({ listener, wanted }) => {
        if (
          wanted &&
          !changed.has("all") &&
          ![...wanted].some((scope) => changed.has(scope))
        ) {
          return;
        }

        try {
          listener(normalized);
        } catch {
          // A subscriber should never break the service that triggered it.
        }
      });
    },
  };
}

export const apiChanges = createChangeEmitter();
