import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { apiChanges, apiRequest, encoded } from "@/lib/services/api/apiClient";
import {
  BIG_MONEY_ALERT_EVENT,
  BIG_MONEY_DECISION_EVENT,
  bigMoneyDecision,
  readBigMoneyAlert,
  reconcileBigMoneyQueue,
  withoutBigMoneyAlert,
} from "@/lib/bigMoneyAlert";

const PREVIEW_MESSAGE =
  "Today\nASAP\nCM24 1QW to KY16\n435miles\n£950\nSameday payment";

export default function BigMoneyAlertHost() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const seenMessageIds = useRef(new Set());
  const handledAlertIds = useRef(new Set());
  const active = queue[0] || null;

  useEffect(() => {
    // Never retain another account's inbox or acknowledged IDs on account switch.
    handledAlertIds.current.clear();
    seenMessageIds.current.clear();
    setQueue([]);
    if (!user?.id) return undefined;

    let running = true;
    let latestRequest = 0;
    const refresh = async () => {
      const currentRequest = ++latestRequest;
      try {
        const response = await apiRequest(`/api/users/${encoded(user.id)}/big-money-alerts`);
        if (!running || currentRequest !== latestRequest) return;
        setQueue((previous) =>
          reconcileBigMoneyQueue(previous, response?.alerts, handledAlertIds.current)
        );
      } catch (requestError) {
        // Keep already-shown items if the network becomes unavailable.
        if (running && currentRequest === latestRequest && requestError?.status !== 404) {
          console.warn("Could not load BIG MONEY alerts:", requestError);
        }
      }
    };

    void refresh();
    const unsubscribe = apiChanges.subscribe(() => { void refresh(); }, "big_money_alerts");
    // Direct Supabase SQL inserts don't publish SSE. Poll lightly while the
    // dashboard is visible, and catch up immediately when it regains focus.
    // The backend remains the source of truth; the poll never creates alerts.
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(refreshIfVisible, 15000);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      running = false;
      window.clearInterval(timer);
      unsubscribe();
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [user?.id]);

  useEffect(() => {
    const receiveAlert = (event) => {
      const alert = readBigMoneyAlert(event.detail);
      if (!alert) return;

      // Reconnects or duplicate signals must not interrupt the driver twice.
      if (alert.messageId && seenMessageIds.current.has(alert.messageId)) return;
      if (alert.messageId) seenMessageIds.current.add(alert.messageId);
      setQueue((previous) => [...previous, alert]);
    };

    window.addEventListener(BIG_MONEY_ALERT_EVENT, receiveAlert);

    // A visual preview for local development only. Not a real job or API write.
    if (
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get("previewBigMoney") === "1"
    ) {
      receiveAlert({
        detail: { messageId: "preview-big-money", originalMessage: PREVIEW_MESSAGE },
      });
    }

    return () => window.removeEventListener(BIG_MONEY_ALERT_EVENT, receiveAlert);
  }, []);

  const choose = async (decision) => {
    const payload = bigMoneyDecision(active, decision);
    if (!payload || saving) return;

    setSaving(true);
    setError("");
    try {
      if (active.id != null && user?.id) {
        // Resolve the pending item durably. ACCEPT only reserves future action X.
        await apiRequest(
          `/api/users/${encoded(user.id)}/big-money-alerts/${encoded(active.id)}`,
          { method: "PATCH", body: { decision } }
        );
      }
      // Protect against an older GET that completed while this PATCH was saving.
      if (active.id != null) handledAlertIds.current.add(String(active.id));
      window.dispatchEvent(new CustomEvent(BIG_MONEY_DECISION_EVENT, { detail: payload }));
      setQueue((previous) => withoutBigMoneyAlert(previous, active));
    } catch (requestError) {
      setError(requestError?.message || "Could not save your decision. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!active) return null;

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-[#152235]/65 backdrop-blur-[5px]" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[535px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_28px_75px_rgba(3,16,36,0.28)] outline-none sm:max-h-[calc(100dvh-48px)] sm:rounded-[22px]"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-5 sm:gap-4 sm:px-7">
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-3xl sm:h-16 sm:w-16 sm:text-4xl">🔥</span>
            <DialogPrimitive.Title className="min-w-0 flex-1 text-[clamp(1.2rem,4.6vw,1.75rem)] font-black tracking-[-0.035em] text-slate-950">
              BIG MONEY JOB
            </DialogPrimitive.Title>
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-orange-600 sm:text-xs">HIGH VALUE</span>
          </header>
          <DialogPrimitive.Description className="sr-only">
            Original WhatsApp message. Choose Accept or Decline.
          </DialogPrimitive.Description>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
            <section className="rounded-2xl bg-gradient-to-br from-[#f5f8fc] to-[#edf2f8] px-4 py-4 sm:px-5 sm:py-5" aria-label="Original WhatsApp message">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <MessageCircle aria-hidden="true" className="h-5 w-5" />
                Original WhatsApp message
              </div>
              <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-base leading-[1.7] text-slate-900 sm:text-lg">
                {active.originalMessage}
              </div>
            </section>
          </div>
          <footer className="grid shrink-0 grid-cols-1 gap-3 border-t border-slate-100 bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:grid-cols-2 sm:px-6 sm:pb-6">
            {error && <div role="alert" className="text-sm text-rose-600 sm:col-span-2">{error}</div>}
            <button type="button" disabled={saving} onClick={() => void choose("accept")}
              className="flex min-h-[60px] w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-base font-extrabold text-white shadow-[0_8px_18px_rgba(5,150,105,0.17)] transition-colors disabled:opacity-60 hover:bg-emerald-700 active:bg-emerald-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
              <Check aria-hidden="true" className="h-6 w-6 stroke-[3]" /> ACCEPT
            </button>
            <button type="button" disabled={saving} onClick={() => void choose("decline")}
              className="flex min-h-[60px] w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-extrabold text-slate-900 transition-colors disabled:opacity-60 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-700">
              <X aria-hidden="true" className="h-6 w-6 stroke-[3]" /> DECLINE
            </button>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
