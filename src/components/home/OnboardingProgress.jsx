import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Account created", "Connect WhatsApp", "Activate RidePicker"];

export default function OnboardingProgress({ current }) {
  return (
    <div className="mx-auto max-w-xs text-left">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-3 py-1.5">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : active
                  ? "border-slate-900 text-slate-900"
                  : "border-slate-200 text-slate-300"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("text-sm", done || active ? "text-slate-900" : "text-slate-400")}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}