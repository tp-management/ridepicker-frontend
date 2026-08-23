import { RefreshCw, MessageCircle, Loader2 } from "lucide-react";
import QRPlaceholder from "@/components/QRPlaceholder";
import { cn } from "@/lib/utils";

/**
 * Left-hand card for the not-yet-connected states:
 * disconnected / logged_out / starting / qr.
 * The user never tells RidePicker they scanned — the UI is driven by status.
 */
export default function WhatsappQrCard({ status, qr, onStart, onRefreshQr }) {
  const qrExpired = qr && Date.now() > qr.expiresAt;

  const statusText =
    status === "starting"
      ? "Preparing WhatsApp connection…"
      : status === "qr"
      ? qrExpired
        ? "QR expired"
        : "Waiting for scan"
      : status === "logged_out"
      ? "WhatsApp is disconnected. Connect again to resume."
      : "Connect WhatsApp to start detecting jobs.";

  const dotClass =
    status === "starting"
      ? "animate-pulse bg-amber-500"
      : status === "qr"
      ? qrExpired
        ? "bg-rose-400"
        : "animate-pulse bg-emerald-500"
      : "bg-slate-300";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
        <MessageCircle className="h-4 w-4 text-emerald-600" /> Connect WhatsApp
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Open WhatsApp on your phone, go to{" "}
        <span className="font-medium text-slate-700">
          Settings → Linked Devices → Link a device
        </span>
        , and scan the code.
      </p>

      <div className="mt-5 flex flex-col items-center">
        {status === "disconnected" || status === "logged_out" ? (
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Connect WhatsApp
          </button>
        ) : status === "starting" ? (
          <div className="flex h-[208px] w-[208px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
          </div>
        ) : qr?.imageDataUrl ? (
          <img
            src={qr.imageDataUrl}
            alt="WhatsApp QR code"
            className={cn("h-[208px] w-[208px] rounded-lg border border-slate-200 bg-white p-3", qrExpired && "opacity-40")}
          />
        ) : (
          <div className={cn("transition-opacity", qrExpired && "opacity-40")}>
            <QRPlaceholder seed={qr?.id || "ridepicker"} />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={cn("h-2 w-2 rounded-full", dotClass)} />
          <span className="text-slate-500">{statusText}</span>
        </div>

        {status === "qr" && (
          <button
            onClick={onRefreshQr}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {qrExpired ? "Retry" : "Refresh"}
          </button>
        )}

        <p className="mt-3 max-w-xs text-center text-xs text-slate-400">
          Your WhatsApp account can be a different number from your RidePicker login.
        </p>
      </div>
    </div>
  );
}