import { config } from "@/lib/config";

const SESSION_KEY = "ridepicker_supabase_auth_v1";
const REFRESH_SKEW_MS = 60_000;

function authBase() {
  const base = String(config.supabaseUrl || "").trim().replace(/\/+$/, "");
  if (!base || !config.supabasePublishableKey) {
    throw new Error("Supabase phone authentication is not configured.");
  }
  return `${base}/auth/v1`;
}

function readJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getStoredAuthSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = readJson(raw);
    return session?.access_token && session?.refresh_token ? session : null;
  } catch {
    return null;
  }
}

function storeAuthSession(session) {
  if (!session?.access_token || !session?.refresh_token) {
    throw new Error("Supabase did not return a valid authentication session.");
  }

  const normalized = {
    ...session,
    expires_at:
      Number(session.expires_at) ||
      Date.now() + Number(session.expires_in || 3600) * 1000,
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  } catch {
    // The authenticated tab can still continue until the next reload.
  }

  return normalized;
}

export function clearStoredAuthSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage failures
  }
}

async function authRequest(path, { method = "POST", body, token } = {}) {
  const response = await fetch(`${authBase()}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      apikey: config.supabasePublishableKey,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  const payload = text ? readJson(text) : null;

  if (!response.ok) {
    const error = new Error(
      payload?.msg ||
        payload?.message ||
        payload?.error_description ||
        payload?.error ||
        `Authentication request failed (${response.status})`
    );
    error.status = response.status;
    error.code = payload?.code || payload?.error_code || null;
    throw error;
  }

  return payload;
}

export async function requestPhoneOtp(phone) {
  const normalizedPhone = String(phone || "").trim();
  if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
    const error = new Error("Enter a phone number in international format, for example +447700900123.");
    error.status = 400;
    throw error;
  }

  await authRequest("/otp", {
    body: {
      phone: normalizedPhone,
      create_user: true,
    },
  });

  return normalizedPhone;
}

export async function verifyPhoneOtp(phone, token) {
  const payload = await authRequest("/verify", {
    body: {
      type: "sms",
      phone: String(phone || "").trim(),
      token: String(token || "").trim(),
    },
  });

  return storeAuthSession(payload);
}

export async function refreshAuthSession(session = getStoredAuthSession()) {
  if (!session?.refresh_token) return null;

  try {
    const payload = await authRequest("/token?grant_type=refresh_token", {
      body: {
        refresh_token: session.refresh_token,
      },
    });
    return storeAuthSession(payload);
  } catch (error) {
    clearStoredAuthSession();
    throw error;
  }
}

export async function getAccessToken() {
  let session = getStoredAuthSession();
  if (!session) return null;

  const expiresAt = Number(session.expires_at || 0);
  if (!expiresAt || expiresAt - Date.now() <= REFRESH_SKEW_MS) {
    session = await refreshAuthSession(session);
  }

  return session?.access_token || null;
}

export async function signOutPhoneAuth() {
  const session = getStoredAuthSession();
  clearStoredAuthSession();

  if (!session?.access_token) return;

  try {
    await authRequest("/logout", {
      token: session.access_token,
      body: {},
    });
  } catch {
    // Local logout is authoritative for this client. Server token expiry/revoke
    // will still happen independently if the network request cannot complete.
  }
}
