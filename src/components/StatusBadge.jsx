import { cn } from "@/lib/utils";

const STYLES = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  interested: "bg-violet-50 text-violet-700 border-violet-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  negotiating: "bg-cyan-50 text-cyan-700 border-cyan-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-rose-50 text-rose-700 border-rose-200",
  ignored: "bg-slate-100 text-slate-500 border-slate-200",
};

const DOTS = {
  new: "bg-blue-500",
  interested: "bg-violet-500",
  contacted: "bg-amber-500",
  negotiating: "bg-cyan-500",
  won: "bg-emerald-500",
  lost: "bg-rose-500",
  ignored: "bg-slate-400",
};

const LABELS = {
  new: "New",
  interested: "Interested",
  contacted: "Contacted",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
  ignored: "Ignored",
};

export default function StatusBadge({ status, className }) {
  const s = status || "new";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[s],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[s])} />
      {LABELS[s]}
    </span>
  );
}