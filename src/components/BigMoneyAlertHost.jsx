import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  BIG_MONEY_ALERT_EVENT,
  BIG_MONEY_DECISION_EVENT,
  bigMoneyDecision,
  readBigMoneyAlert,
} from "@/lib/bigMoneyAlert";

const PREVIEW_MESSAGE =
  "🚕 BIG MONEY TRANSFER\n\nHeathrow Airport → Central London\nTonight 23:45\n7 passengers + luggage\nOffer: £350\n\nPlease let me know ASAP if anyone can take it.";

export default function BigMoneyAlertHost() {
  const [queue, setQueue] = useState([]);
  const seenMessageIds = useRef(new Set());
  const active = queue[0] || null;

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

  const choose = (decision) => {
    const payload = bigMoneyDecision(active, decision);
    if (!payload) return;

    // A local acknowledgement event only. No WhatsApp reply, booking, or DB write.
    window.dispatchEvent(
      new CustomEvent(BIG_MONEY_DECISION_EVENT, { detail: payload })
    );
    setQueue((previous) => previous.slice(1));
  };

  if (!active) return null;

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[101] flex h-[calc(100dvh-16px)] w-[calc(100vw-16px)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border-2 border-amber-400 bg-white shadow-[0_0_36px_rgba(245,158,11,0.45)] outline-none sm:h-[min(740px,calc(100dvh-48px))] sm:w-[calc(100vw-48px)]"
        >
          <header className="shrink-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 px-5 py-5 text-center shadow-sm sm:px-7 sm:py-7">
            <DialogPrimitive.Title className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              🔥 BIG MONEY JOB
            </DialogPrimitive.Title>
          </header>

          <DialogPrimitive.Description className="sr-only">
            Full original WhatsApp message. Choose Accept or Decline.
          </DialogPrimitive.Description>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
            <div className="whitespace-pre-wrap break-words text-base font-medium leading-7 text-slate-900 sm:text-lg sm:leading-8">
              {active.originalMessage}
            </div>
          </div>

          <footer className="shrink-0 space-y-3 border-t border-slate-200 bg-white px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pb-6">
            <button
              type="button"
              onClick={() => choose("accept")}
              className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-4 text-xl font-extrabold tracking-wide text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-emerald-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:bg-emerald-800"
            >
              ACCEPT
            </button>
            <button
              type="button"
              onClick={() => choose("decline")}
              className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-rose-600 px-5 py-4 text-xl font-extrabold tracking-wide text-white shadow-lg shadow-rose-900/20 transition-colors hover:bg-rose-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-rose-600 active:bg-rose-800"
            >
              DECLINE
            </button>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
