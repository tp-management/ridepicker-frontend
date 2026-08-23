import { Link } from "react-router-dom";
import { Power, MessageCircle, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Always-visible status banner. Never replaces the dashboard — it sits on top
// of the operational/financial content so historical data stays accessible even
// when RidePicker is paused or WhatsApp is disconnected.
export default function StatusBanner() {
  const { waStatus, whatsappConnected, mode, hasActiveSubscription, setMode, retryReconnect } = useProduct();
  const { toast } = useToast();

  const handleEnable = () => {
    const ok = setMode("assist");
    if (ok) {
      toast({ title: "RidePicker set to Assist", description: "Monitoring new messages and alerting you to jobs." });
    }
  };

  let tone, Icon, title, description, action;
  if (waStatus === "reconnecting") {
    tone = "amber";
    Icon = AlertTriangle;
    title = "WhatsApp reconnecting…";
    description = "Trying to restore your connection. You can still review your jobs and payments.";
    action = (
      <button
        onClick={retryReconnect}
        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </button>
    );
  } else if (!whatsappConnected) {
    tone = "slate";
    Icon = MessageCircle;
    title = "WhatsApp is not connected";
    description = "Connect WhatsApp to let RidePicker detect new driving jobs. Your existing jobs remain available below.";
    action = (
      <Link
        to="/whatsapp"
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
      >
        <MessageCircle className="h-3.5 w-3.5" /> Connect WhatsApp
      </Link>
    );
  } else if (mode === "off") {
    tone = "slate";
    Icon = Power;
    title = "RidePicker is paused";
    description = "New WhatsApp messages are not being monitored. Your jobs, payments and figures remain available below.";
    action = hasActiveSubscription ? (
      <button
        onClick={handleEnable}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
      >
        <Power className="h-3.5 w-3.5" /> Turn on RidePicker
      </button>
    ) : (
      <Link
        to="/billing"
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
      >
        Activate subscription
      </Link>
    );
  } else {
    tone = "emerald";
    Icon = CheckCircle2;
    title = "RidePicker is active";
    description = "Monitoring new messages and alerting you to job opportunities.";
    action = null;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5",
        tone === "amber" && "border-amber-200 bg-amber-50",
        tone === "emerald" && "border-emerald-200 bg-emerald-50",
        tone === "slate" && "border-slate-200 bg-white"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          tone === "amber" && "bg-amber-100 text-amber-600",
          tone === "emerald" && "bg-emerald-100 text-emerald-600",
          tone === "slate" && "bg-slate-100 text-slate-500"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}