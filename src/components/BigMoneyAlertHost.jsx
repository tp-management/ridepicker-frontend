import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, MessageCircle, X } from "lucide-react";
import {
  BIG_MONEY_ALERT_EVENT,
  BIG_MONEY_DECISION_EVENT,
  bigMoneyDecision,
  readBigMoneyAlert,
} from "@/lib/bigMoneyAlert";

const PREVIEW_MESSAGE =
  "Today\nASAP\nCM24 1QW → KY16\n435 miles\n£950\nSameday payment";;

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
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-[#091321]/75 backdrop-blur-[7px]" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[550px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(3,16,36,0.32),0_0_45px_rgba(245,158,11,0.12)] outline-none sm:max-h-[calc(100dvh-48px)] sm:rounded-[34px]"
        >
          <header className="relative shrink-0 overflow-hidden border-b border-orange-100 bg-gradient-to-br from-[#fff0d5] via-[#fff8ef] to-white px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl"
            />
            <div className="relative flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#ffe6cf] to-[#ffd7c6] text-[38px] shadow-[0_10px_30px_rgba(234,88,12,0.12)] sm:h-[72px] sm:w-[72px] sm:text-[42px]"
              >
                🔥
              </span>
              <DialogPrimitive.Title className="min-w-0 text-[clamp(1.45rem,6vw,2.15rem)] font-black leading-[1.05] tracking-[-0.045em] text-[#46190f]">
                BIG MONEY JOB
              </DialogPrimitive.Title>
            </div>
          </header>

          <DialogPrimitive.Description className="sr-only">
            Original WhatsApp message. Choose Accept or Decline.
          </DialogPrimitive.Description>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 py-5 sm:px-7 sm:py-6">
            <div className="rounded-[22px] border border-[#e3eaf4] bg-gradient-to-br from-[#f8fbff] to-[#eef3fa] px-4 py-5 shadow-[0_10px_30px_rgba(25,47,86,0.05)] sm:px-6 sm:py-6">
              <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                <MessageCircle aria-hidden="true" className="h-[18px] w-[18px] text-slate-400" />
                Original WhatsApp message
              </div>
              <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[16px] font-medium leading-[1.7] text-[#243956] sm:text-[18px]">
                {active.originalMessage}
              </div>
            </div>
          </div>

          <footer className="shrink-0 space-y-3 border-t border-slate-100 bg-white px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pb-7 sm:pt-5">
            <button
              type="button"
              onClick={() => choose("accept")}
              className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-[#00b781] to-[#00a972] px-5 py-4 text-[18px] font-extrabold tracking-[0.01em] text-white shadow-[0_12px_25px_rgba(0,168,115,0.2)] transition-all duration-150 hover:brightness-105 active:scale-[0.99] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-emerald-600 sm:min-h-[68px]"
            >
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#00a972]">
                <Check className="h-5 w-5 stroke-[3]" />
              </span>
              ACCEPT
            </button>
            <button
              type="button"
              onClick={() => choose("decline")}
              className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-[18px] border border-rose-200 bg-gradient-to-r from-[#ffe1e6] to-[#ffd8de] px-5 py-4 text-[18px] font-extrabold tracking-[0.01em] text-rose-600 transition-all duration-150 hover:brightness-[0.98] active:scale-[0.99] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-rose-600 sm:min-h-[68px]"
            >
              <X aria-hidden="true" className="h-7 w-7 stroke-[3]" />
              DECLINE
            </button>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
