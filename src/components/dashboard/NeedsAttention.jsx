import { Link } from "react-router-dom";
import { AlertTriangle, Info, ChevronRight } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import { computeAttention } from "@/lib/finance";
import { cn } from "@/lib/utils";

// Intelligent alerts derived from real account data. Each links to the
// relevant filtered Jobs view. Renders nothing when there is nothing to flag.
export default function NeedsAttention() {
  const { jobs } = useProduct();
  const alerts = computeAttention(jobs);
  if (!alerts.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Needs attention</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {alerts.map((a) => (
          <Link
            key={a.key}
            to={a.to}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                a.tone === "warning" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
              )}
            >
              {a.tone === "warning" ? <AlertTriangle className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-900">{a.title}</div>
            </div>
            {a.value && <div className="text-sm font-semibold text-slate-900">{a.value}</div>}
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}