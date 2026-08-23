import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { authService } from "@/lib/services/authService";
import { profileService } from "@/lib/services/profileService";
import { jobsService } from "@/lib/services/jobsService";
import { activityService } from "@/lib/services/activityService";
import { ridePickerService } from "@/lib/services/ridePickerService";
import { whatsappService } from "@/lib/services/whatsappService";
import { billingService } from "@/lib/services/billingService";
import { isApiMode } from "@/lib/config";
import { JOBS as DEMO_JOBS, ACTIVITY as DEMO_ACTIVITY } from "@/lib/mockData";

const ProductContext = createContext(null);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const MODE_DETAIL = {
  assist: "Monitoring new messages and alerting you to jobs.",
  autopilot: "Monitoring and alerting. Autonomous contacting coming soon.",
};

/**
 * Central product/service layer.
 *
 * Concepts kept separate: currentUser (from auth), whatsappConnection,
 * ridePickerMode, jobs, activity. This provider talks ONLY to the service
 * facades in src/lib/services/* — it never imports mockDataStore. Mock
 * implementations live behind those services; replace them with Supabase/API
 * adapters when VITE_DATA_MODE=api without changing the consuming UI.
 */
export function ProductProvider({ children }) {
  const { user, applyPhoneSession } = useAuth();
  const demoModeRef = useRef(false);

  // ---- WhatsApp session ----
  // Driven by whatsappService (models the real RidePicker backend lifecycle).
  // Adaptive polling: ~1.5s while pairing/reconnecting, ~10s once connected,
  // stopped when the provider unmounts. The service also notifies on change.
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
      return;
    }
    let active = true;
    let timer;
    const tick = async () => {
      if (!active) return;
      let status = null;
      try {
        const s = await whatsappService.refreshSession(uid);
        if (active) {
          setWaSession(s);
          setWhatsappLoading(false);
        }
        status = s?.status || null;
      } catch {
        // ignore transient poll errors; next tick retries
      }
      if (!active) return;
      const fast = status === "starting" || status === "qr" || status === "reconnecting";
      timer = setTimeout(tick, fast ? 1500 : 10000);
    };
    // Initial async load, then start polling.
    (async () => {
      try {
        const s = await whatsappService.getSession(uid);
        if (active) {
          setWaSession(s);
          setWhatsappLoading(false);
        }
      } catch {
        if (active) setWhatsappLoading(false);
      }
      tick();
    })();
    const uw = whatsappService.subscribe(() => {
      if (!active) return;
      whatsappService
        .getSession(uid)
        .then((s) => setWaSession(s))
        .catch(() => {});
    });
    return () => {
      active = false;
      clearTimeout(timer);
      uw();
    };
  }, [user?.id, setWaSession]);

  // ---- RidePicker mode ----
  // Loaded asynchronously from ridePickerService (see the data effect below) so
  // an API adapter can fetch it over HTTP without changing this provider.
  const [mode, setModeState] = useState("off");
  const [botStartedAt, setBotStartedAt] = useState(null);

  // ---- Subscription ----
  // Loaded asynchronously from billingService (see the data effect below).
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

  // Load all account data from the services and subscribe to changes. This is
  // the ONLY place that fetches jobs/activity/mode/subscription; pages read from
  // context. mockDataStore is never imported here.
  useEffect(() => {
    const uid = user?.id;
    if (!uid) {
      setRealJobs([]);
      setRealActivity([]);
      setModeState("off");
      setBotStartedAt(null);
      setSubscription(null);
      return;
    }
    let active = true;

    // Initial load shows a loading state; later subscription-driven refreshes
    // (after writes) update the data silently without flickering the loader.
    const loadJobs = async (withLoading) => {
      try {
        if (withLoading) setJobsLoading(true);
        const j = await jobsService.list(uid);
        if (active) setRealJobs(j);
      } catch (e) {
        if (active) setJobsError(e);
      } finally {
        if (withLoading) setJobsLoading(false);
      }
    };
    const refreshJobs = () => loadJobs(false);
    const refreshActivity = async () => {
      try {
        const a = await activityService.list(uid);
        if (active) setRealActivity(a);
      } catch (e) {
        if (active) setActivityError(e);
      }
    };
    const refreshMode = async () => {
      try {
        const st = await ridePickerService.getState(uid);
        if (!active) return;
        setModeState(st.mode);
        setBotStartedAt(st.botStartedAt);
      } catch {
        // leave current mode on read failure
      }
    };
    const refreshSub = async () => {
      try {
        const sub = await billingService.getSubscription(user);
        if (active) setSubscription(sub);
      } catch {
        // leave current subscription on read failure
      }
    };

    loadJobs(true);
    refreshActivity();
    refreshMode();
    refreshSub();

    const uj = jobsService.subscribe(refreshJobs);
    const ua = activityService.subscribe(refreshActivity);
    const ur = ridePickerService.subscribe(refreshMode);
    const ub = billingService.subscribe(refreshSub);
    return () => {
      active = false;
      uj();
      ua();
      ur();
      ub();
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
      // Fire-and-forget; the activity service subscription updates realActivity.
      activityService.add(user?.id, entry).catch(() => {});
    },
    [user?.id]
  );

  const setMode = useCallback(
    (m) => {
      // Autopilot is not available yet — never let the app enter that state.
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

  // Log WhatsApp lifecycle events as the session status changes. The first
  // settled status (after the async session load) seeds the "previous" value
  // so loading an already-connected session does NOT emit a spurious event.
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
    // The real backend writes WhatsApp lifecycle activity itself. Mock mode
    // keeps the client-side activity simulation.
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

  // Permanent connection loss (user disconnect / logged out) stops monitoring.
  // A TEMPORARY drop (reconnecting) does NOT turn RidePicker off — when the
  // connection is restored, Assist resumes automatically. Guarded on
  // whatsappLoading so the initial async session load can't trigger it.
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