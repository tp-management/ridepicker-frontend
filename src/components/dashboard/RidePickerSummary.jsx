import { Sparkles } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import { computeSummary, PERIODS } from "@/lib/finance";

// Concise insight interpreting existing account/job/payment data.
export default function RidePickerSummary({ period }) {
  const { jobs } = useProduct();
  const text = computeSummary(jobs, period);
  const label = PERIODS.find((p) => p.key === period)?.label || "This period";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-slate-200">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label} summary</div>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{text}</p>
      </div>
    </div>
  );
}
