import { Check, LogOut, Power } from "lucide-react";
import { formatFull } from "@/lib/format";

export default function WhatsappConnectedCard({
  account,
  connectedAt,
  onDisconnect,
  onEnableRidePicker,
  mode = "off",
}) {
  const active = mode && mode !== "off";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">WhatsApp connected ✓</div>
            {connectedAt && (
              <div className="mt-0.5 text-xs text-slate-400">Connected {formatFull(connectedAt)}</div>
            )}
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" /> Disconnect
        </button>
      </div>

      {account && (
        <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Connected account
          </div>
          <div className="mt-1.5 text-sm font-semibold text-slate-900">{account.name}</div>
          <div className="text-sm text-slate-500">{account.phone}</div>
          <p className="mt-2 text-xs text-slate-400">
            This WhatsApp account is linked to RidePicker for message monitoring.
          </p>
        </div>
      )}

      {active ? (
        <div data-testid="wa-active" className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <Power className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-700">
            WhatsApp is connected. RidePicker is active — monitoring new messages for jobs.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <Power className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600">
              WhatsApp is connected. RidePicker is currently paused.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={onEnableRidePicker}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Power className="h-4 w-4" /> Enable RidePicker
            </button>
          </div>
        </>
      )}
    </div>
  );
}