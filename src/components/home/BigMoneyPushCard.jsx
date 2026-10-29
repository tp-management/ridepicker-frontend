import { useEffect, useState } from "react";
import { Bell, Info } from "lucide-react";
import { apiRequest, encoded } from "@/lib/services/api/apiClient";

function supportsPush() {
  return typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;
}

function decodeVapidPublicKey(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

async function saveSubscription(userId, subscription) {
  return apiRequest(`/api/users/${encoded(userId)}/push-subscriptions`, {
    method: "POST",
    body: { endpoint: subscription.endpoint },
  });
}

export default function BigMoneyPushCard({ userId }) {
  const [status, setStatus] = useState("checking");
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("checking");
    setDismissed(false);
    setError("");
    if (!userId) return () => { active = false; };
    if (!supportsPush()) {
      setStatus("unsupported");
      return () => { active = false; };
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return () => { active = false; };
    }
    (async () => {
      try {
        if (Notification.permission === "granted") {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await saveSubscription(userId, subscription);
            if (active) setStatus("enabled");
            return;
          }
        }
        if (active) setStatus("ready");
      } catch {
        if (active) setStatus("ready");
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const enable = async () => {
    if (!userId || !supportsPush() || status === "enabling") return;
    setError("");
    setStatus("enabling");
    try {
      // A real click must trigger the browser's permission prompt.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "ready");
        return;
      }
      const { publicKey } = await apiRequest("/api/push/public-key");
      if (!publicKey) throw new Error("Push notifications are not configured.");
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidPublicKey(publicKey),
        });
      }
      await saveSubscription(userId, subscription);
      setStatus("enabled");
    } catch {
      setStatus("ready");
      setError("Could not enable notifications. Please try again.");
    }
  };

  if (!userId || dismissed || status === "checking" || status === "enabled") return null;

  const disabled = status === "unsupported" || status === "denied";
  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5" aria-label="BIG MONEY notifications">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">Get BIG MONEY JOB alerts</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Receive notifications even when RidePicker is closed.
          </p>
          {disabled ? (
            <p className="mt-2 text-xs text-amber-700">
              {status === "denied"
                ? "Notifications are blocked. Allow them in your browser settings."
                : "On iPhone, add RidePicker to your Home Screen to enable notifications."}
            </p>
          ) : (
            <button
              type="button"
              onClick={enable}
              disabled={status === "enabling"}
              className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {status === "enabling" ? "Enabling…" : "Enable notifications"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="ml-3 mt-3 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
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
