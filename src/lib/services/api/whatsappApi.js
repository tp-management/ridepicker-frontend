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

function withQuery(path, values = {}) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `${path}?${query}` : path;
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

  async listChats(userId, { limit = 100 } = {}) {
    const data = await apiRequest(
      withQuery(`${basePath(userId)}/chats`, { limit })
    );
    return data?.chats || [];
  },

  async listMessages(
    userId,
    {
      chatId = null,
      limit = 100,
      before = null,
      after = null,
      fromMe = null,
      processingStatus = null,
    } = {}
  ) {
    const root = chatId
      ? `${basePath(userId)}/chats/${encoded(chatId)}/messages`
      : `/api/users/${encoded(userId)}/messages`;
    const data = await apiRequest(
      withQuery(root, {
        limit,
        before,
        after,
        fromMe,
        processingStatus,
      })
    );
    return data?.messages || [];
  },

  async getMessage(userId, messageId) {
    const data = await apiRequest(
      `/api/users/${encoded(userId)}/messages/${encoded(messageId)}`
    );
    return data?.message || null;
  },

  async sendMessage(userId, chatId, text) {
    const data = await apiRequest(
      `${basePath(userId)}/chats/${encoded(chatId)}/messages`,
      {
        method: "POST",
        body: { text },
      }
    );
    apiChanges.notify();
    return data?.message || null;
  },

  async simulateDrop(userId) {
    // No production endpoint intentionally exists for this dev-only action.
    return whatsappApi.getSession(userId);
  },
};
