import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { authService } from "@/lib/services/authService";
import { profileService } from "@/lib/services/profileService";
import { jobsService } from "@/lib/services/jobsService";
import { activityService } from "@/lib/services/activityService";
import { ridePickerService } from "@/lib/services/ridePickerService";
import { whatsappService } from "@/lib/services/whatsappService";
import { billingService } from "@/lib/services/billingService";
import { liveEventsService } from "@/lib/services/liveEventsService";
import { isApiMode } from "@/lib/config";
import { JOBS as DEMO_JOBS, ACTIVITY as DEMO_ACTIVITY } from "@/lib/mockData";

const ProductContext = createContext(null);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const MODE_DETAIL = {
  assist: "Monitoring new messages and alerting you to jobs.",
  autopilot: "Monitoring and alerting. Autonomous contacting coming soon.",
};

export function ProductProvider({ children }) {
  const { user, applyPhoneSession } = useAuth();
  const demoModeRef = useRef(false);

  // One persistent server push stream drives all production refreshes. It only
  // carries invalidation scopes; each service fetches its own fresh data when
  // its scope changes. There is no interval-based account polling.
  useEffect(() => {
    if (!user?.id) return undefined;
    return liveEventsService.connect(user.id);
  }, [user?.id]);

  // ---- WhatsApp session ----
  const [waSession, setWaSessionRaw] = useState(null);
  const [whatsappLoading, setWhatsappLoading] = useState(true);
  const setWaSession = useCallback((next) => {
    setWaSessionRaw((prev) => {
      if (prev === next) return prev;
      if (
        prev &&
        next &&
        prev.status === next.status &&
        prev.qr?.id === next?.qr?.id &&
        prev.pairingCode?.code === next?.pairingCode?.code &&
        prev.pairingCode?.issuedAt === next?.pairingCode?.issuedAt &&
        prev.connectedAt === next?.connectedAt &&
        prev.account?.phone === next?.account?.phone
      )
        return prev;
      return next;
    });
  }, []);

  useEffect(() => {
    const uid = user?.id;
    if (!uid) {
      setWaSession(null);
      setWhatsappLoading(false);
      return undefined;
    }

    let active = true;
    setWhatsappLoading(true);

    const refresh = async (initial = false) => {
      try {
        const session = await whatsappService.getSession(uid);
        if (active) setWaSession(session);
      } catch {
        // Keep the last known state. A later push or reconnect can recover it.
      } finally {
        if (active && initial) setWhatsappLoading(false);
      }
    };

    void refresh(true);
    const unsubscribe = whatsappService.subscribe(() => {
      if (active) void refresh(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.id, setWaSession]);

  // ---- RidePicker mode ----
  const [mode, setModeState] = useState("off");
  const [botStartedAt, setBotStartedAt] = useState(null);

  // ---- Subscription ----
  const [subscription, setSubscription] = useState(null);
  const hasActiveSubscription =
    subscription?.status === "active" ||
    (subscription?.status === "cancelled" &&
      Boolean(subscription?.activeUntil) &&
      new Date(subscription.activeUntil) > new Date());

  // ---- Data ----
  const [demoMode, setDemoMode] = useState(false);
  const [demoJobs, setDemoJobs] = useState(DEMO_JOBS);
  const [demoActivity, setDemoActivity] = useState(DEMO_ACTIVITY);
  const [realJobs, setRealJobs] = useState([]);
  const [realActivity, setRealActivity] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [activityError, setActivityError] = useState(null);

  // Initial reads happen once. After that each domain refreshes only when the
  // live stream names that domain or a local write emits the same scope.
  useEffect(() => {
    const uid = user?.id;
    if (!uid) {
      setRealJobs([]);
      setRealActivity([]);
      setModeState("off");
      setBotStartedAt(null);
      setSubscription(null);
      return undefined;
    }
    let active = true;
    let lastProfileSnapshot = null;

    const loadJobs = async (withLoading) => {
      try {
        if (withLoading) setJobsLoading(true);
        const jobs = await jobsService.list(uid);
        if (active) {
          setRealJobs(jobs);
          setJobsError(null);
        }
      } catch (error) {
        if (active) setJobsError(error);
      } finally {
        if (withLoading && active) setJobsLoading(false);
      }
    };

    const refreshJobs = () => loadJobs(false);

    const refreshActivity = async () => {
      try {
        const activity = await activityService.list(uid);
        if (active) {
          setRealActivity(activity);
          setActivityError(null);
        }
      } catch (error) {
        if (active) setActivityError(error);
      }
    };

    const refreshMode = async () => {
      try {
        const state = await ridePickerService.getState(uid);
        if (!active) return;
        setModeState(state.mode);
        setBotStartedAt(state.botStartedAt);
      } catch {
        // Keep the last known mode until the next push/reconnect refresh.
      }
    };

    const refreshSub = async () => {
      try {
        const sub = await billingService.getSubscription(user);
        if (active) setSubscription(sub);
      } catch {
        // Keep the last known subscription until the next push.
      }
    };

    const refreshProfile = async () => {
      try {
        const profile = await profileService.get(uid);
        if (!active || !profile) return;

        const snapshot = JSON.stringify(profile);
        if (snapshot === lastProfileSnapshot) return;
        lastProfileSnapshot = snapshot;

        applyPhoneSession({
          ...user,
          full_name: profile.name ?? user?.full_name ?? "",
          name: profile.name ?? user?.name ?? "",
          phone: profile.phone ?? user?.phone ?? "",
          email: profile.email ?? user?.email ?? "",
          profile,
        });
      } catch {
        // Keep the current auth/profile view until the next push.
      }
    };

    void loadJobs(true);
    void refreshActivity();
    void refreshMode();
    void refreshSub();
    void refreshProfile();

    const unsubscribeJobs = jobsService.subscribe(refreshJobs);
    const unsubscribeActivity = activityService.subscribe(refreshActivity);
    const unsubscribeMode = ridePickerService.subscribe(refreshMode);
    const unsubscribeBilling = billingService.subscribe(refreshSub);
    const unsubscribeProfile = profileService.subscribe(refreshProfile);

    return () => {
      active = false;
      unsubscribeJobs();
      unsubscribeActivity();
      unsubscribeMode();
      unsubscribeBilling();
      unsubscribeProfile();
    };
  }, [user?.id]);

  const waStatus =
    waSession?.status === "connected"
      ? "connected"
      : waSession?.status === "reconnecting"
      ? "reconnecting"
      : "disconnected";
  const whatsappConnected = waSession?.status === "connected";
  const waConnectedAt = waSession?.connectedAt || null;
  const waAccount = waSession?.account || null;
  const botActive = mode !== "off";
  const monitoring = botActive && whatsappConnected;
  const jobs = demoMode ? demoJobs : realJobs;
  const activity = demoMode ? demoActivity : realActivity;

  const addActivity = useCallback(
    (ev) => {
      const entry = {
        id: `e${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        time: new Date().toISOString(),
        ...ev,
      };
      if (demoModeRef.current) setDemoActivity((prev) => [entry, ...prev]);
      activityService.add(user?.id, entry).catch(() => {});
    },
    [user?.id]
  );

  const setMode = useCallback(
    (m) => {
      if (m === "autopilot") return false;
      if (m !== "off" && waStatus !== "connected") return false;
      if (m !== "off" && !hasActiveSubscription) return false;
      if (mode === m) return true;
      const startedAt = m !== "off" && mode === "off" ? new Date().toISOString() : botStartedAt;
      setModeState(m);
      if (m !== "off" && mode === "off") setBotStartedAt(startedAt);
      ridePickerService.setMode(user?.id, m, startedAt).catch(() => {});
      if (!isApiMode()) {
        addActivity({
          type: "ridepicker",
          title: m === "off" ? "RidePicker turned off" : `RidePicker set to ${cap(m)}`,
          detail: m === "off" ? "Monitoring stopped." : MODE_DETAIL[m],
        });
      }
      return true;
    },
    [mode, waStatus, hasActiveSubscription, addActivity, user?.id, botStartedAt]
  );

  const connectWhatsApp = useCallback(async () => {
    if (!user?.id) return null;
    const session = await whatsappService.startSession(user.id);
    setWaSession(session);
    return session;
  }, [user?.id, setWaSession]);

  const disconnectWhatsApp = useCallback(async () => {
    if (!user?.id) return null;
    const session = await whatsappService.disconnect(user.id);
    setWaSession(session);
    return session;
  }, [user?.id, setWaSession]);

  const simulateDrop = useCallback(async () => {
    if (!user?.id) return null;
    const session = await whatsappService.simulateDrop(user.id);
    setWaSession(session);
    return session;
  }, [user?.id, setWaSession]);

  const retryReconnect = useCallback(async () => {
    if (!user?.id) return null;
    const session = await whatsappService.retryReconnect(user.id);
    setWaSession(session);
    return session;
  }, [user?.id, setWaSession]);

  const refreshPairingCode = useCallback(async () => {
    if (!user?.id) return null;
    const request = whatsappService.refreshPairingCode || whatsappService.startSession;
    const session = await request(user.id);
    setWaSession(session);
    return session;
  }, [user?.id, setWaSession]);

  const refreshQr = useCallback(async () => {
    if (!user?.id) return null;
    const session = await whatsappService.refreshQr(user.id);
    setWaSession(session);
    return session;
  }, [user?.id, setWaSession]);

  const prevWaStatusRef = useRef(null);
  const waStatusSeededRef = useRef(false);
  useEffect(() => {
    if (whatsappLoading) return;
    if (!waStatusSeededRef.current) {
      waStatusSeededRef.current = true;
      prevWaStatusRef.current = waStatus;
      return;
    }
    const prev = prevWaStatusRef.current;
    if (prev === waStatus) return;
    prevWaStatusRef.current = waStatus;
    if (isApiMode()) return;
    if (waStatus === "connected") {
      addActivity({
        type: "whatsapp",
        title: prev === "reconnecting" ? "WhatsApp reconnected" : "WhatsApp connected",
        detail: "",
      });
    } else if (waStatus === "reconnecting") {
      addActivity({ type: "whatsapp", title: "WhatsApp connection interrupted", detail: "Reconnecting…" });
    } else if (waStatus === "disconnected" && prev !== "disconnected") {
      addActivity({ type: "whatsapp", title: "WhatsApp disconnected", detail: "" });
    }
  }, [waStatus, whatsappLoading, addActivity]);

  useEffect(() => {
    if (whatsappLoading) return;
    if (waStatus === "disconnected" && mode !== "off") {
      setModeState("off");
      setBotStartedAt(null);
      ridePickerService.setMode(user?.id, "off", null).catch(() => {});
    }
  }, [waStatus, mode, user?.id, whatsappLoading]);

  const enableDemo = useCallback(() => {
    demoModeRef.current = true;
    setDemoMode(true);
    setDemoJobs(DEMO_JOBS);
    setDemoActivity(DEMO_ACTIVITY);
  }, []);

  const disableDemo = useCallback(() => {
    demoModeRef.current = false;
    setDemoMode(false);
  }, []);

  const changeJobStatus = useCallback(
    (id, status) => {
      const list = demoModeRef.current ? demoJobs : realJobs;
      const job = list.find((j) => j.id === id);
      const detail = job ? `${job.pickup} → ${job.dropoff}` : "";
      if (demoModeRef.current) setDemoJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
      else jobsService.updateStatus(user?.id, id, status).catch(() => {});
      if (!isApiMode()) {
        addActivity({ type: "job", title: `Job status changed to ${cap(status)}`, detail });
      }
    },
    [demoJobs, realJobs, addActivity, user?.id]
  );

  const setJobPayment = useCallback(
    (id, patch) => {
      const list = demoModeRef.current ? demoJobs : realJobs;
      const job = list.find((j) => j.id === id);
      const detail = job ? `${job.pickup} → ${job.dropoff}` : "";
      const next = {};
      if (patch.paymentStatus !== undefined) next.paymentStatus = patch.paymentStatus;
      if (patch.paymentMethod !== undefined) next.paymentMethod = patch.paymentMethod;
      if (demoModeRef.current) setDemoJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...next } : j)));
      else jobsService.updatePayment(user?.id, id, next).catch(() => {});
      const label = next.paymentStatus === "paid" ? "marked paid" : next.paymentStatus === "unpaid" ? "marked unpaid" : "updated";
      if (!isApiMode()) {
        addActivity({ type: "job", title: `Payment ${label}`, detail });
      }
    },
    [demoJobs, realJobs, addActivity, user?.id]
  );

  const addExpense = useCallback(
    (id, expense) => {
      const entry = { id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, ...expense };
      if (demoModeRef.current)
        setDemoJobs((prev) => prev.map((j) => (j.id === id ? { ...j, expenses: [...(j.expenses || []), entry] } : j)));
      else jobsService.addExpense(user?.id, id, entry).catch(() => {});
    },
    [demoJobs, realJobs, user?.id]
  );

  const removeExpense = useCallback(
    (id, expenseId) => {
      if (demoModeRef.current)
        setDemoJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, expenses: (j.expenses || []).filter((e) => e.id !== expenseId) } : j))
        );
      else jobsService.removeExpense(user?.id, id, expenseId).catch(() => {});
    },
    [demoJobs, realJobs, user?.id]
  );

  const updateProfile = useCallback(
    async (profile) => {
      const updated = await profileService.update(user?.id, profile);
      if (updated) applyPhoneSession(updated);
      return updated;
    },
    [user?.id, applyPhoneSession]
  );

  const resetDevData = useCallback(() => {
    authService.resetDevAccount();
    window.location.reload();
  }, []);

  const isDevUser = authService.isDevUser(user);

  const logout = useCallback(() => {
    authService.logout();
    try {
      localStorage.removeItem("base44_access_token");
      localStorage.removeItem("token");
    } catch {
      // ignore storage errors
    }
    window.location.href = "/";
  }, []);

  const value = {
    user,
    waStatus,
    waConnectedAt,
    waAccount,
    whatsappConnected,
    whatsappLoading,
    mode,
    setMode,
    botActive,
    botStartedAt,
    monitoring,
    subscription,
    hasActiveSubscription,
    demoMode,
    jobs,
    activity,
    jobsLoading,
    jobsError,
    activityError,
    connectWhatsApp,
    disconnectWhatsApp,
    simulateDrop,
    retryReconnect,
    refreshPairingCode,
    refreshQr,
    whatsappSession: waSession,
    enableDemo,
    disableDemo,
    changeJobStatus,
    setJobPayment,
    addExpense,
    removeExpense,
    updateProfile,
    resetDevData,
    isDevUser,
    logout,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
}
