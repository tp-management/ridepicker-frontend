import { MessageCircle } from "lucide-react";
import { useRidePickerMode } from "@/lib/product/useRidePickerMode";
import ModeControl from "@/components/ModeControl";
import { cn } from "@/lib/utils";

const MODE_TEXT = {
  off: "RidePicker is inactive.",
  assist: "Monitoring new messages and alerting you to jobs.",
  autopilot: "Monitoring and alerting. Autonomous contacting coming soon.",
};

function StatusDot({ on }) {
  return <span className={cn("h-2 w-2 rounded-full", on ? "bg-emerald-500" : "bg-slate-300")} />;
}

function useModeControl() {
  const { whatsappConnected, mode, onMode } = useRidePickerMode();
  return { whatsappConnected, mode, onMode };
}

export function GlobalStatus() {
  const { whatsappConnected, mode, onMode } = useModeControl();
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <MessageCircle className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600">WhatsApp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot on={whatsappConnected} />
          <span className={cn("text-xs font-medium", whatsappConnected ? "text-emerald-600" : "text-slate-400")}>
            {whatsappConnected ? "Connected" : "Offline"}
          </span>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-sm text-slate-600">RidePicker</div>
        <ModeControl mode={mode} onMode={onMode} disabled={!whatsappConnected} />
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        {!whatsappConnected ? "Connect WhatsApp to enable RidePicker." : MODE_TEXT[mode]}
      </p>
    </div>
  );
}

export function MobileStatusBar() {
  const { whatsappConnected, mode, onMode } = useModeControl();
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-2.5 sm:hidden">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <StatusDot on={whatsappConnected} />
          <span className="text-slate-600">WhatsApp {whatsappConnected ? "on" : "off"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot on={mode !== "off" && whatsappConnected} />
          <span className="text-slate-600">
            RidePicker {!whatsappConnected || mode === "off" ? "off" : mode}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <ModeControl mode={mode} onMode={onMode} disabled={!whatsappConnected} />
      </div>
    </div>
  );
}