// Mock WhatsApp session service.
//
// Models the production phone-pairing lifecycle:
//   STARTING -> pairing code available -> CONNECTED,
// plus RECONNECTING / LOGGED_OUT.
//
// The real API uses the RidePicker login phone with Baileys
// socket.requestPairingCode(). Mock mode mirrors that UI contract without
// generating a QR code.

import { mockDataStore } from "@/lib/mock/mockDataStore";

const PAIRING_TTL_MS = 5 * 60 * 1000;
const STARTING_MS = 900;
const CONNECT_MIN_MS = 14000;
const CONNECT_MAX_MS = 20000;
const RECONNECT_MS = 6000;

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());
const transient = new Map();
const timers = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => Date.now();
const makeSessionId = () => `sess_${now()}_${Math.random().toString(36).slice(2, 8)}`;
const makeCode = () => String(Math.floor(10_000_000 + Math.random() * 90_000_000));

const userPhone = (user) => user?.phone || user?.profile?.phone || null;
const accountFor = (user) => ({
  name: user?.full_name || user?.name || user?.profile?.name || "WhatsApp account",
  phone: userPhone(user),
});

const makePairingCode = (user) => {
  const issuedAt = new Date().toISOString();
  return {
    code: makeCode(),
    phone: userPhone(user),
    issuedAt,
    displayExpiresAt: new Date(Date.now() + PAIRING_TTL_MS).toISOString(),
  };
};

const clearTimers = (userId) => {
  const list = timers.get(userId);
  if (list) list.forEach(clearTimeout);
  timers.delete(userId);
};

const armTimer = (userId, fn, ms) => {
  if (!timers.has(userId)) timers.set(userId, []);
  const id = setTimeout(fn, ms);
  timers.get(userId).push(id);
};

const setTransient = (userId, session) => {
  transient.set(userId, session);
  notify();
};

const connectAuto = (userId) => {
  const current = transient.get(userId);
  if (!current || current.status !== "starting") return;

  clearTimers(userId);
  transient.delete(userId);
  const user = mockDataStore.getUser(userId);
  mockDataStore.setWhatsapp(userId, {
    sessionId: current.sessionId || makeSessionId(),
    status: "connected",
    account: accountFor(user),
    connectedAt: new Date().toISOString(),
    qr: null,
    pairingCode: null,
  });
  notify();
};

const armConnection = (userId) => {
  armTimer(
    userId,
    () => connectAuto(userId),
    CONNECT_MIN_MS + Math.floor(Math.random() * (CONNECT_MAX_MS - CONNECT_MIN_MS))
  );
};

const armLifecycle = (userId) => {
  clearTimers(userId);
  armTimer(
    userId,
    () => {
      const current = transient.get(userId);
      if (!current || current.status !== "starting") return;
      const user = mockDataStore.getUser(userId);
      setTransient(userId, {
        ...current,
        pairingCode: makePairingCode(user),
      });
      armConnection(userId);
    },
    STARTING_MS
  );
};

const ensureRecover = (userId) => {
  if (timers.get(userId)?.length) return;
  armTimer(
    userId,
    () => {
      const wa = mockDataStore.getUser(userId)?.whatsapp;
      if (wa?.status !== "reconnecting") return;
      mockDataStore.setWhatsapp(userId, {
        ...wa,
        status: "connected",
        connectedAt: wa.connectedAt || new Date().toISOString(),
        qr: null,
        pairingCode: null,
      });
      notify();
    },
    RECONNECT_MS
  );
};

export const mockWhatsappService = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getSession(userId) {
    await delay(0);
    const current = transient.get(userId);
    if (current) return current;

    const wa = mockDataStore.getUser(userId)?.whatsapp;
    if (!wa) return null;

    if (wa.status === "connected") {
      return {
        sessionId: wa.sessionId,
        status: "connected",
        account: wa.account,
        connectedAt: wa.connectedAt,
        qr: null,
        pairingCode: null,
      };
    }

    if (wa.status === "reconnecting") {
      ensureRecover(userId);
      return {
        sessionId: wa.sessionId,
        status: "reconnecting",
        account: wa.account,
        connectedAt: wa.connectedAt,
        qr: null,
        pairingCode: null,
      };
    }

    if (wa.status === "logged_out") {
      return {
        sessionId: wa.sessionId || null,
        status: "logged_out",
        account: null,
        connectedAt: null,
        qr: null,
        pairingCode: null,
      };
    }

    return null;
  },

  async refreshSession(userId) {
    return mockWhatsappService.getSession(userId);
  },

  async startSession(userId) {
    await delay(250);
    const current = transient.get(userId);
    if (current?.status === "starting") {
      return mockWhatsappService.refreshPairingCode(userId);
    }

    const session = {
      sessionId: makeSessionId(),
      status: "starting",
      account: null,
      connectedAt: null,
      qr: null,
      pairingCode: null,
    };
    setTransient(userId, session);
    armLifecycle(userId);
    return session;
  },

  async refreshPairingCode(userId) {
    await delay(150);
    const current = transient.get(userId);
    if (!current || current.status !== "starting") {
      return mockWhatsappService.startSession(userId);
    }

    clearTimers(userId);
    const user = mockDataStore.getUser(userId);
    const next = {
      ...current,
      pairingCode: makePairingCode(user),
    };
    setTransient(userId, next);
    armConnection(userId);
    return next;
  },

  // Kept only for adapter compatibility. The production UI no longer uses QR.
  async refreshQr(userId) {
    return mockWhatsappService.refreshPairingCode(userId);
  },

  async simulateDrop(userId) {
    await delay(0);
    const wa = mockDataStore.getUser(userId)?.whatsapp;
    if (!wa || wa.status !== "connected") return mockWhatsappService.getSession(userId);

    clearTimers(userId);
    transient.delete(userId);
    mockDataStore.setWhatsapp(userId, {
      ...wa,
      status: "reconnecting",
      qr: null,
      pairingCode: null,
    });
    ensureRecover(userId);
    notify();
    return mockWhatsappService.getSession(userId);
  },

  async retryReconnect(userId) {
    await delay(200);
    const wa = mockDataStore.getUser(userId)?.whatsapp;
    if (!wa || wa.status !== "reconnecting") return mockWhatsappService.getSession(userId);

    clearTimers(userId);
    transient.delete(userId);
    mockDataStore.setWhatsapp(userId, {
      ...wa,
      status: "connected",
      connectedAt: wa.connectedAt || new Date().toISOString(),
      qr: null,
      pairingCode: null,
    });
    notify();
    return mockWhatsappService.getSession(userId);
  },

  async disconnect(userId) {
    await delay(150);
    clearTimers(userId);
    transient.delete(userId);
    const wa = mockDataStore.getUser(userId)?.whatsapp;
    mockDataStore.setWhatsapp(userId, {
      sessionId: wa?.sessionId || makeSessionId(),
      status: "logged_out",
      account: null,
      connectedAt: null,
      qr: null,
      pairingCode: null,
    });
    notify();
    return mockWhatsappService.getSession(userId);
  },
};
