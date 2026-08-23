import { Banknote, CreditCard, FileText, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const METHODS = {
  cash: { icon: Banknote, label: "Cash" },
  card: { icon: CreditCard, label: "Card" },
  invoice: { icon: FileText, label: "Invoice" },
  account: { icon: Landmark, label: "Account" },
};

// Small, professional payment label. Shows method (when known) + paid/unpaid.
// Returns null when the job has no payment status (e.g. not yet won).
export default function PaymentChip({ status, method, className }) {
  if (status !== "paid" && status !== "unpaid") return null;
  const m = method ? METHODS[method] : null;
  const paid = status === "paid";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        paid ? "text-emerald-600" : "text-slate-500",
        className
      )}
    >
      {m && <m.icon className="h-3 w-3" />}
      {m ? `${m.label} · ${paid ? "Paid" : "Unpaid"}` : paid ? "Paid" : "Unpaid"}
    </span>
  );
}