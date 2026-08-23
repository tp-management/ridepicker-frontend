import { apiChanges, apiRequest, encoded } from "./apiClient";

const basePath = (userId) => `/api/users/${encoded(userId)}/whatsapp`;
const snapshots = new Map();

function sessionFrom(data) {
  return data?.session || null;
}

function snapshot(session) {
  if (!session) return "null";
  return JSON.stringify({
    status: session.status,
    accountPhone: session.account?.phone || null,
    connectedAt: session.connectedAt || null,
    pairingCode: session.pairingCode?.code || null,
    pairingIssuedAt: session.pairingCode?.issuedAt || null,
  });
}

function remember(userId, session, notifyOnChange = false) {
  const next = snapshot(session);
  const previous = snapshots.get(userId);
  snapshots.set(userId, next);
  if (notifyOnChange && previous !== undefined && previous !== next) {
    apiChanges.notify();
  }
  return session;
}

export const whatsappApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async getSession(userId) {
    const data = await apiRequest(basePath(userId));
    return remember(userId, sessionFrom(data));
  },

  async refreshSession(userId) {
    const data = await apiRequest(basePath(userId));
    return remember(userId, sessionFrom(data), true);
  },

  async startSession(userId) {
    const data = await apiRequest(`${basePath(userId)}/pairing-code`, {
      method: "POST",
      body: {},
    });
    const session = remember(userId, sessionFrom(data));
    apiChanges.notify();
    return session;
  },

  async refreshPairingCode(userId) {
    const data = await apiRequest(`${basePath(userId)}/pairing-code`, {
      method: "POST",
      body: {},
    });
    const session = remember(userId, sessionFrom(data));
    apiChanges.notify();
    return session;
  },

  async refreshQr(userId) {
    const data = await apiRequest(`${basePath(userId)}/refresh-qr`, {
      method: "POST",
    });
    const session = remember(userId, sessionFrom(data));
    apiChanges.notify();
    return session;
  },

  async disconnect(userId) {
    const data = await apiRequest(basePath(userId), { method: "DELETE" });
    const session = remember(userId, sessionFrom(data));
    apiChanges.notify();
    return session;
  },

  async retryReconnect(userId) {
    const data = await apiRequest(`${basePath(userId)}/reconnect`, {
      method: "POST",
    });
    const session = remember(userId, sessionFrom(data));
    apiChanges.notify();
    return session;
  },

  async simulateDrop(userId) {
    // No production endpoint intentionally exists for this dev-only action.
    return whatsappApi.getSession(userId);
  },
};
