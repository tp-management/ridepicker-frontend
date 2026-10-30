import { useEffect, useState } from "react";
import { Bell, Info } from "lucide-react";
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

export default function BigMoneyPushCard({ userId }) {
  const [state, setState] = useState("checking");
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setState("checking");
    setDismissed(false);
    setError("");
    if (!userId) return () => { active = false; };
    if (!canPush()) {
      setState("unsupported");
      return () => { active = false; };
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return () => { active = false; };
    }
    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!active) return;
        const previouslyEnabled = localStorage.getItem(keyForUser(userId)) === "yes";
        setState(subscription && Notification.permission === "granted" && previouslyEnabled
          ? "enabled" : "ready");
      } catch {
        if (active) setState("ready");
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const enable = async () => {
    if (!userId || state === "enabling" || !canPush()) return;
    setError("");
    setState("enabling");
    try {
      // Keep the native permission prompt directly attached to this click.
      const permission = await Notification.requestPermission();
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
      localStorage.setItem(keyForUser(userId), "yes");
      setState("enabled");
    } catch (reason) {
      setState("ready");
      setError(reason?.status === 503
        ? "Notifications are not configured on the server yet."
        : "Could not enable notifications. Please try again.");
    }
  };

  if (!userId || dismissed || state === "checking" || state === "enabled") return null;
  const unavailable = state === "unsupported" || state === "denied";

  return (
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
          <button type="button" onClick={() => setDismissed(true)}
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
  );
}
