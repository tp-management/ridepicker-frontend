import { WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import StateShell from "./StateShell";

export default function ConnectionIssueState({ onRetry }) {
  return (
    <StateShell
      icon={WifiOff}
      iconClass="bg-amber-50 text-amber-600"
      title="WhatsApp connection interrupted"
      description="RidePicker is temporarily unable to monitor new messages. Reconnecting… If it doesn't recover shortly, try the button below."
      action={
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Retry now
        </button>
      }
    >
      <Link to="/whatsapp" className="text-sm font-medium text-slate-500 hover:text-slate-900">
        Open WhatsApp settings
      </Link>
    </StateShell>
  );
}