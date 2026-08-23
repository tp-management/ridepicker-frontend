import { Activity as ActivityIcon } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import { formatFull } from "@/lib/format";
import StateShell from "./StateShell";
import DemoPreviewLink from "./DemoPreviewLink";

const cap = (s) => s[0].toUpperCase() + s.slice(1);

export default function ActiveEmptyState({ onPreviewDemo }) {
  const { mode, botStartedAt, waConnectedAt } = useProduct();
  const isAutopilot = mode === "autopilot";

  return (
    <StateShell
      icon={ActivityIcon}
      iconClass="bg-emerald-50 text-emerald-600"
      title={isAutopilot ? "RidePicker is on Autopilot" : "RidePicker is monitoring"}
      description={
        isAutopilot
          ? "Monitoring new WhatsApp messages and alerting you to jobs. Autonomous contacting and negotiation are coming soon."
          : "Monitoring new WhatsApp messages and alerting you to jobs. No jobs detected yet — new opportunities will appear here automatically."
      }
      action={<DemoPreviewLink onClick={onPreviewDemo} />}
    >
      <div className="mx-auto mt-2 flex max-w-xs flex-col gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>Mode</span>
          <span className="font-medium text-slate-900">{cap(mode)}</span>
        </div>
        {botStartedAt && (
          <div className="flex items-center justify-between">
            <span>Monitoring started</span>
            <span className="font-medium text-slate-600">{formatFull(botStartedAt)}</span>
          </div>
        )}
        {waConnectedAt && (
          <div className="flex items-center justify-between">
            <span>WhatsApp</span>
            <span className="font-medium text-emerald-600">Connected</span>
          </div>
        )}
      </div>
    </StateShell>
  );
}