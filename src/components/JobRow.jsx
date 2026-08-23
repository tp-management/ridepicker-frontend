import { ArrowRight, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PaymentChip from "./PaymentChip";
import { formatJobTime, priceLabel } from "@/lib/format";

export default function JobRow({ job, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group grid w-full grid-cols-1 gap-1.5 border-b border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 sm:grid-cols-[1.6fr_1fr_1.1fr_1fr_1fr_auto] sm:items-center sm:gap-4 sm:px-5"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="truncate">{job.pickup}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{job.dropoff}</span>
        </div>
        <div className="mt-0.5 text-xs text-slate-500 sm:hidden">{formatJobTime(job.pickupTime)}</div>
      </div>

      <div className="hidden text-sm text-slate-600 sm:block">{formatJobTime(job.pickupTime)}</div>

      <div className="min-w-0">
        <div className="text-base font-bold text-slate-900">{priceLabel(job.price)}</div>
        <div className="mt-0.5">
          <PaymentChip status={job.paymentStatus} method={job.paymentMethod} />
        </div>
      </div>

      <div className="text-sm text-slate-600">
        {job.vehicle}
        {job.passengers ? <span className="text-slate-400"> · {job.passengers} pax</span> : null}
      </div>

      <div className="truncate text-sm text-slate-500">{job.source}</div>

      <div className="flex items-center justify-between sm:justify-end sm:gap-2">
        <StatusBadge status={job.status} />
        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400 sm:hidden" />
      </div>
    </button>
  );
}