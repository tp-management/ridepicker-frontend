import { cn } from "@/lib/utils";

const STEPS = [
  { label: "WhatsApp opportunity", detail: "A job is posted in a chat or group." },
  { label: "Job detected", detail: "RidePicker recognises a driving opportunity." },
  { label: "Opportunity evaluated", detail: "Checked against your preferences — route, price and vehicle." },
  { label: "Sender contacted", detail: "RidePicker reaches out to the sender on your behalf.", soon: true },
  { label: "Follow-up / negotiation", detail: "RidePicker follows up and negotiates within your rules.", soon: true },
  { label: "Job secured", detail: "The opportunity is confirmed and locked in.", soon: true },
  { label: "Driver notified", detail: "You're notified of the progress that matters." },
];

export default function JobLifecycle() {
  return (
    <div className="relative">
      <div className="absolute bottom-3 left-[11px] top-3 w-px bg-slate-200" />
      <div className="space-y-4">
        {STEPS.map((s, i) => (
          <div key={s.label} className="relative flex gap-3">
            <span
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                s.soon
                  ? "border-amber-300 bg-amber-50 text-amber-600"
                  : "border-emerald-500 bg-emerald-500 text-white"
              )}
            >
              {i + 1}
            </span>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                {s.label}
                {s.soon && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    Soon
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}