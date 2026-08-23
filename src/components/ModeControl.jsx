import { cn } from "@/lib/utils";

const MODES = [
  { key: "off", label: "Off" },
  { key: "assist", label: "Assist" },
  { key: "autopilot", label: "Autopilot", soon: true },
];

export default function ModeControl({ mode, onMode, disabled, className }) {
  return (
    <div
      className={cn(
        "flex w-full items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5",
        disabled && "opacity-50",
        className
      )}
    >
      {MODES.map((m) => {
        const active = mode === m.key;
        return (
          <button
            key={m.key}
            type="button"
            disabled={disabled || m.soon}
            onClick={() => !disabled && !m.soon && onMode(m.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-colors",
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
              (disabled || m.soon) && "cursor-not-allowed",
              m.soon && !active && "text-slate-400"
            )}
          >
            {m.label}
            {m.soon && (
              <span className="rounded bg-amber-100 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}