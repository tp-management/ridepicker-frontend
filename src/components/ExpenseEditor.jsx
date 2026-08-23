import { useState } from "react";
import { Plus, X } from "lucide-react";
import { jobExpenses, jobProfit } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const EXPENSE_CATEGORIES = [
  { key: "fuel", label: "Fuel" },
  { key: "parking", label: "Parking" },
  { key: "tolls", label: "Tolls" },
  { key: "congestion", label: "Congestion charge" },
  { key: "commission", label: "Commission" },
  { key: "other", label: "Other" },
];

const catLabel = (k) => EXPENSE_CATEGORIES.find((c) => c.key === k)?.label || k;

// Lightweight job expense tracking + profit summary.
export default function ExpenseEditor({ job, onAdd, onRemove }) {
  const [category, setCategory] = useState("fuel");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const expenses = job.expenses || [];
  const totalExpenses = jobExpenses(job);
  const profit = jobProfit(job);
  const hasPrice = job.price != null;

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onAdd(job.id, { category, amount: amt, note: note.trim() });
    setAmount("");
    setNote("");
  };

  return (
    <div className="space-y-4">
      {/* Profit summary */}
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div>
          <div className="text-xs text-slate-500">Job price</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">{hasPrice ? `£${job.price}` : "TBC"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Expenses</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-700">£{totalExpenses}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Profit</div>
          <div className={cn("mt-0.5 text-sm font-semibold", hasPrice ? "text-emerald-600" : "text-slate-400")}>
            {hasPrice ? `£${profit}` : "—"}
          </div>
        </div>
      </div>

      {/* Existing expenses */}
      {expenses.length > 0 && (
        <div className="space-y-1.5">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800">
                  {catLabel(e.category)} · £{e.amount}
                </div>
                {e.note && <div className="truncate text-xs text-slate-500">{e.note}</div>}
              </div>
              <button
                onClick={() => onRemove(job.id, e.id)}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600"
                aria-label="Remove expense"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add expense */}
      <div className="space-y-2 rounded-lg border border-dashed border-slate-200 p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Add expense</div>
        <div className="flex flex-wrap gap-2">
          <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
        >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="£ amount"
            className="w-24 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!parseFloat(amount)}
            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}