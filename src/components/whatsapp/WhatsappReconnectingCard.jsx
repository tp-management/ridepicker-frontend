import { WifiOff, RefreshCw } from "lucide-react";

export default function WhatsappReconnectingCard({ onRetry }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-3">
        <WifiOff className="h-5 w-5 text-amber-600" />
        <div>
          <div className="text-sm font-semibold text-amber-900">Connection interrupted</div>
          <div className="text-sm text-amber-700">
            Connection interrupted. Reconnecting… RidePicker is reconnecting to WhatsApp.
          </div>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
      >
        <RefreshCw className="h-4 w-4" /> Retry now
      </button>
    </div>
  );
}