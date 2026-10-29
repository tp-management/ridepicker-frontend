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

const optInKey = (userId) => "ridepicker:big-money-push-enabled:" + userId;

export default function BigMoneyPushCard({ userId }) {
  const [status, setStatus] = useState("checking");
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");

  useEffect(() => {
    setStatus("checking");
    setDismissed(false);
    setError("");
    setCode("");
    setVerifiedToken("");
    if (!userId) return;
    if (!supportsPush()) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    // Only a display hint, never proof of identity. This code never uploads
    // a subscription without a fresh, Supabase-verified phone session.
    if (Notification.permission === "granted" && localStorage.getItem(optInKey(userId)) === "yes") {
      setStatus("enabled");
    } else {
      setStatus("ready");
    }
  }, [userId]);

  const startOtp = async () => {
    if (!userId) return;
    setError("");
    setStatus("sending-code");
    try {
      await apiRequest(`/api/users/${encoded(userId)}/push-otp`, { method: "POST" });
      setStatus("enter-code");
    } catch (error) {
      setStatus("ready");
      setError(error?.status === 429
        ? "Please wait before requesting another code."
        : "Phone verification unavailable. Check SMS setup.");
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(code)) return;
    setError("");
    setStatus("verifying");
    try {
      const result = await apiRequest(`/api/users/${encoded(userId)}/push-otp/verify`, {
        method: "POST",
        body: { code },
      });
      if (!result?.accessToken) throw new Error("Could not verify phone");
      // This token stays in memory only; never persist it to localStorage.
      setVerifiedToken(result.accessToken);
      setStatus("verified");
    } catch {
      setStatus("enter-code");
      setError("Incorrect or expired code. Please try again.");
    }
  };

  const enable = async () => {
    if (!verifiedToken || !supportsPush()) return;
    setError("");
    // Run directly from the button click: iOS requires a user gesture here.
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "verified");
      return;
    }
    setStatus("enabling");
    try {
      const { publicKey } = await apiRequest("/api/push/public-key");
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidPublicKey(publicKey),
        });
      }
      await apiRequest(`/api/users/${encoded(userId)}/push-subscriptions`, {
        method: "POST",
        headers: { Authorization: "Bearer " + verifiedToken },
        body: { endpoint: subscription.endpoint },
      });
      localStorage.setItem(optInKey(userId), "yes");
      setVerifiedToken("");
      setStatus("enabled");
    } catch (error) {
      setStatus("verified");
      setError(error?.status === 403
        ? "Verification expired. Please refresh the page and verify again."
        : "Could not enable notifications. Please try again.");
    }
  };

  if (!userId || dismissed || status === "checking" || status === "enabled") return null;

  const disabled = status === "unsupported" || status === "denied";
  const codeEntry = status === "enter-code" || status === "verifying";
  const busy = ["sending-code", "verifying", "enabling"].includes(status);

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
            <>
              {codeEntry && (
                <div className="mt-3">
                  <label htmlFor="push-otp" className="block text-xs font-medium text-slate-700">
                    Enter the 6-digit code sent to your account phone
                  </label>
                  <input id="push-otp" type="text" inputMode="numeric" autoComplete="one-time-code"
                    value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="mt-1 block w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base tracking-widest text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={codeEntry ? verifyOtp : status === "verified" || status === "enabling" ? enable : startOtp}
                disabled={busy || (codeEntry && code.length !== 6)}
                className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {status === "sending-code" ? "Sending SMS…" :
                  status === "verifying" ? "Verifying…" :
                  status === "enabling" ? "Enabling…" :
                  codeEntry ? "Verify code" :
                  status === "verified" ? "Allow notifications" : "Enable notifications"}
              </button>
            </>
          )}
          <button type="button" onClick={() => setDismissed(true)}
            className="ml-3 mt-3 text-xs font-medium text-slate-500 hover:text-slate-700">
            Not now
          </button>
          {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
          <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Verify your phone once per device, then allow browser notifications.
          </p>
        </div>
      </div>
    </section>
  );
}
