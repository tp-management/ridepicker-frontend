import { useProduct } from "@/lib/product/ProductContext";
import { PERIODS, computeFinance, computeOps } from "@/lib/finance";

const TONE = {
  expected: "text-slate-900",
  received: "text-emerald-600",
  outstanding: "text-amber-600",
  expenses: "text-slate-700",
  net: "text-slate-900",
};

// Compact, scannable financial summary — labels + numbers, not large KPI cards.
export default function FinancialOverview({ period, onPeriod }) {
  const { jobs } = useProduct();
  const f = computeFinance(jobs, period);
  const ops = computeOps(jobs, period);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Financial overview</h2>
        <select
          value={period}
          onChange={(e) => onPeriod(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:border-slate-400 focus:outline-none"
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-5 sm:divide-y-0">
        <Metric label="Expected revenue" value={f.expected} tone={TONE.expected} />
        <Metric label="Received" value={f.received} tone={TONE.received} />
        <Metric label="Outstanding" value={f.outstanding} tone={TONE.outstanding} />
        <Metric label="Expenses" value={f.expenses} tone={TONE.expenses} />
        <Metric label="Net received" value={f.net} tone={TONE.net} />
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
        <OpMetric label="Jobs won" value={ops.jobsWon} />
        <OpMetric label="Upcoming" value={ops.upcoming} />
        <OpMetric label="Completed" value={ops.completed} />
      </div>
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className="px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone}`}>£{value}</div>
    </div>
  );
}

function OpMetric({ label, value }) {
  return (
    <div className="px-4 py-2.5 text-center">
      <div className="text-lg font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}