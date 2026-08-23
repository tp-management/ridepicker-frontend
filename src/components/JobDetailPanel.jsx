import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Car,
  Users,
  Plane,
  MessageCircle,
  User,
  ArrowRight,
  Check,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import PaymentChip from "./PaymentChip";
import ExpenseEditor from "./ExpenseEditor";
import { formatJobTime, formatRelative, priceLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUSES = ["new", "interested", "contacted", "negotiating", "won", "lost", "ignored"];
const PAYMENT_STATUSES = ["unpaid", "paid"];
const PAYMENT_METHODS = ["cash", "card", "invoice", "account"];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export default function JobDetailPanel({ job, onClose, onStatusChange, onPayment, onAddExpense, onRemoveExpense }) {
  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <span className="truncate">{job.pickup}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{job.dropoff}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={job.status} />
                  <PaymentChip status={job.paymentStatus} method={job.paymentMethod} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {onStatusChange && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Job status</div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => onStatusChange(job.id, s)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                          job.status === s
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {cap(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onPayment && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment · independent from job status
                  </div>
                  <div className="flex gap-2">
                    {PAYMENT_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => onPayment(job.id, { paymentStatus: s })}
                        className={cn(
                          "flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                          (job.paymentStatus || "unpaid") === s
                            ? s === "paid"
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                              : "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {cap(s)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => onPayment(job.id, { paymentMethod: null })}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        !job.paymentMethod
                          ? "border-slate-400 bg-slate-100 text-slate-700"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      No method
                    </button>
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => onPayment(job.id, { paymentMethod: m })}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                          job.paymentMethod === m
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onAddExpense && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Expenses & profit
                  </div>
                  <ExpenseEditor job={job} onAdd={onAddExpense} onRemove={onRemoveExpense} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field icon={Clock} label="Pickup" value={formatJobTime(job.pickupTime)} />
                <Field icon={Plane} label="Price" value={priceLabel(job.price)} strong />
                <Field icon={Car} label="Vehicle" value={job.vehicle} />
                <Field
                  icon={Users}
                  label="Passengers"
                  value={job.passengers ? `${job.passengers}` : "Not specified"}
                />
                <Field
                  icon={Plane}
                  label="Flight number"
                  value={job.flightNumber ?? "Not specified"}
                />
                <Field icon={MessageCircle} label="Source chat" value={job.source} />
                <Field icon={User} label="Sender" value={job.sender ?? "Not specified"} />
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Original message
                </div>
                <div className="rounded-xl rounded-tl-sm border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-1.5 text-xs font-medium text-slate-500">
                    {job.source}
                    {job.sender ? ` · ${job.sender}` : ""}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {job.originalMessage}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status history
                </div>
                <div className="relative">
                  <div className="absolute bottom-3 left-[7px] top-3 w-px bg-slate-200" />
                  <div className="space-y-4">
                    {job.timeline.map((t, i) => (
                      <div key={i} className="relative pl-6">
                        <span
                          className={cn(
                            "absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full",
                            t.done ? "bg-emerald-500" : "border-2 border-slate-200 bg-white"
                          )}
                        >
                          {t.done && <Check className="h-2.5 w-2.5 text-white" />}
                        </span>
                        <div
                          className={cn(
                            "text-sm font-medium",
                            t.done ? "text-slate-900" : "text-slate-400"
                          )}
                        >
                          {t.label}
                        </div>
                        <div className="text-xs text-slate-400">
                          {t.time ? formatRelative(t.time) : "Pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ icon: Icon, label, value, strong }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={cn("mt-1 text-sm", strong ? "font-semibold text-slate-900" : "text-slate-700")}>
        {value}
      </div>
    </div>
  );
}