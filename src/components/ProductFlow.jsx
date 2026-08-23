import { ArrowRight } from "lucide-react";

const STEPS = ["Connect WhatsApp", "Turn RidePicker on", "Detected jobs appear automatically"];

export default function ProductFlow() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-500">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-x-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {s}
          </span>
          {i < STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-300" />}
        </div>
      ))}
    </div>
  );
}