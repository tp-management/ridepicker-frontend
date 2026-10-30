import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bell, Info, X } from "lucide-react";
import { apiRequest, encoded } from "@/lib/services/api/apiClient";

function canPush() {
  return typeof window !== "undefined"
    && window.isSecureContext
    && "Notification" in window
    && "PushManager" in window
    && "serviceWorker" in navigator;
}

function publicKeyBytes(key) {
  const base64 = key.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

const keyForUser = (userId) => "ridepicker:push-enabled:" + userId;
const reminderKey = (userId) => "ridepicker:push-reminder-dismissed:" + userId;

function reminderDismissed(userId) {
  try {
    return sessionStorage.getItem(reminderKey(userId)) === "yes";
  } catch {
    return false;
  }
}

export default function BigMoneyPushCard({ userId }) {
  const [state, setState] = useState("checking");
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");
  const [reminderOpen, setReminderOpen] = useState(false);
  const enabling = useRef(false);

  useEffect(() => {
    let active = true;
    let lastCheck = 0;
    setState("checking");
    setDismissed(false);
    setError("");
    setReminderOpen(false);
    if (!userId) return () => { active = false; };

    const applyStatus = (next, checkId) => {
      if (!active || checkId !== lastCheck || enabling.current) return;
      setState(next);
      if (next === "enabled") {
        setReminderOpen(false);
      } else if (!reminderDismissed(userId)) {
        setReminderOpen(true);
      }
    };

    const checkPermission = async () => {
      if (enabling.current) return;
      const checkId = ++lastCheck;
      if (!canPush()) return applyStatus("unsupported", checkId);
      if (Notification.permission === "denied") return applyStatus("denied", checkId);
      if (Notification.permission !== "granted") return applyStatus("ready", checkId);
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        let previouslyEnabled = false;
        try {
          previouslyEnabled = localStorage.getItem(keyForUser(userId)) === "yes";
        } catch {
          // Storage access can be blocked; offer to register again.
        }
        applyStatus(subscription && previouslyEnabled ? "enabled" : "ready", checkId);
      } catch {
        applyStatus("ready", checkId);
      }
    };

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void checkPermission();
    };
    void checkPermission();
    window.addEventListener("focus", checkWhenVisible);
    document.addEventListener("visibilitychange", checkWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", checkWhenVisible);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, [userId]);

  const dismissReminder = () => {
    setReminderOpen(false);
    try {
      sessionStorage.setItem(reminderKey(userId), "yes");
    } catch {
      // Dismissal for this render still works without storage.
    }
  };

  const enable = async () => {
    if (!userId || enabling.current || !canPush()) return;
    enabling.current = true;
    setError("");
    setState("enabling");
    try {
      // Keep the native permission prompt directly attached to this click.
      const permission = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "ready");
        return;
      }
      const { publicKey } = await apiRequest("/api/push/public-key");
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKeyBytes(publicKey),
        });
      }
      await apiRequest(`/api/users/${encoded(userId)}/push-subscriptions`, {
        method: "POST",
        body: { endpoint: subscription.endpoint },
      });
      try {
        localStorage.setItem(keyForUser(userId), "yes");
        sessionStorage.removeItem(reminderKey(userId));
      } catch {
        // Push registration worked even if browser storage is unavailable.
      }
      setState("enabled");
      setReminderOpen(false);
    } catch (reason) {
      setState(Notification.permission === "denied" ? "denied" : "ready");
      setError(reason?.status === 503
        ? "Notifications are not configured on the server yet."
        : "Could not enable notifications. Please try again.");
    } finally {
      enabling.current = false;
    }
  };

  if (!userId || dismissed || state === "checking" || state === "enabled") return null;
  const unavailable = state === "unsupported" || state === "denied";

  return (
    <>
      <section className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">Enable BIG MONEY notifications</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Get high-value job alerts even when RidePicker is closed.
          </p>
          {unavailable ? (
            <p className="mt-2 text-xs text-amber-700">
              {state === "denied"
                ? "Allow RidePicker notifications in your browser settings."
                : "This browser does not support Push here. On iPhone, add RidePicker to Home Screen first."}
            </p>
          ) : (
            <button type="button" disabled={state === "enabling"} onClick={enable}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
              <Bell className="h-4 w-4" aria-hidden="true" />
              {state === "enabling" ? "Enabling…" : "Enable notifications"}
            </button>
          )}
          <button type="button" onClick={() => { dismissReminder(); setDismissed(true); }}
            className="ml-3 mt-3 text-xs font-medium text-slate-500 hover:text-slate-700">
            Not now
          </button>
          {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
          <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Allow notifications once in your browser.
          </p>
        </div>
      </div>
      </section>
      <DialogPrimitive.Root modal={false} open={reminderOpen} onOpenChange={(open) => {
        if (!open) dismissReminder();
      }}>
        <DialogPrimitive.Portal>
          <div aria-hidden="true" className="fixed inset-0 z-[70] bg-slate-950/55" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-[71] w-[calc(100vw-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Bell className="h-6 w-6" aria-hidden="true" />
              </span>
              <DialogPrimitive.Close
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close notification reminder"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Title className="mt-4 text-lg font-semibold text-slate-900">
              Don't miss BIG MONEY JOB alerts
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-slate-600">
              {state === "denied"
                ? "Notifications are blocked. Allow RidePicker in your browser or phone settings to receive job alerts."
                : state === "unsupported"
                  ? "On iPhone, add RidePicker to your Home Screen from Safari first. Then open the installed app to enable notifications."
                  : "Enable notifications so new BIG MONEY jobs reach you even when RidePicker is closed."}
            </DialogPrimitive.Description>
            {state !== "denied" && state !== "unsupported" && (
              <button
                type="button"
                onClick={enable}
                disabled={state === "enabling"}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {state === "enabling" ? "Enabling…" : "Enable notifications"}
              </button>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
            <button
              type="button"
              onClick={dismissReminder}
              className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              Not now
            </button>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
