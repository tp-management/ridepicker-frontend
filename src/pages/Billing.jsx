import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Receipt,
  ExternalLink,
  RefreshCw,
  Download,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useProduct } from "@/lib/product/ProductContext";
import { billingService } from "@/lib/services/billingService";
import { config } from "@/lib/config";
import { useToast, toast } from "@/components/ui/use-toast";

const PLAN_NAME = "RidePicker Premium";
const PRICE_LABEL = "€180 / month";

export default function Billing() {
  const { user } = useAuth();
  const { subscription } = useProduct();
  const { toast } = useToast();

  const status = subscription?.status || "none";

  const pay = () => {
    const url = billingService.getPaymentUrl();
    if (!url) {
      toast({ title: "Checkout not configured", description: "Billing checkout has not been configured for this environment." });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const markPaid = () => {
    billingService.activate(user);
    toast({ title: "Subscription activated", description: "RidePicker Premium is now active." });
  };
  const fail = () => {
    billingService.simulatePaymentFailure(user);
    toast({ title: "Payment failed (demo)", description: "Latest payment could not be processed." });
  };
  const updatePm = () => {
    billingService.updatePaymentMethod(user);
    toast({ title: "Payment method updated", description: "Your card details were updated." });
  };
  const cancel = () => {
    billingService.cancel(user);
    toast({ title: "Subscription cancelled", description: "RidePicker stays active until your paid period ends." });
  };
  const reactivate = () => {
    billingService.reactivate(user);
    toast({ title: "Subscription reactivated", description: "RidePicker Premium is active again." });
  };
  const reset = () => {
    billingService.reset(user);
    toast({ title: "Billing reset (demo)" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Billing</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your RidePicker subscription.</p>
        </div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to settings
        </Link>
      </div>

      {status === "none" && (
        <Card>
          <PlanHeader />
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-800">Payment required</div>
            <p className="mt-1 text-sm text-amber-700">
              Activate your subscription to start using RidePicker.
            </p>
          </div>
          <button
            onClick={pay}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto sm:px-6"
          >
            Pay €180 <ExternalLink className="h-4 w-4" />
          </button>
        </Card>
      )}

      {status === "active" && (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-900">{PLAN_NAME}</div>
              <div className="mt-0.5 text-sm text-slate-500">{PRICE_LABEL} · Billed monthly</div>
            </div>
            <StatusPill tone="active">
              <CheckCircle2 className="h-3.5 w-3.5" /> Active
            </StatusPill>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Detail icon={CalendarDays} label="Next payment">
              €180 on {format(new Date(subscription.nextPaymentDate), "d MMM yyyy")}
            </Detail>
            <Detail icon={CreditCard} label="Payment method">
              {subscription.paymentMethod?.brand} ending in {subscription.paymentMethod?.last4}
            </Detail>
          </div>

          <div className="mt-5">
            <button
              onClick={updatePm}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" /> Manage payment method
            </button>
          </div>

          <InvoiceHistory invoices={subscription.invoices} />
        </Card>
      )}

      {status === "past_due" && (
        <Card>
          <PlanHeader />
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-800">
              <AlertTriangle className="h-4 w-4" /> Payment issue
            </div>
            <p className="mt-1 text-sm text-rose-700">
              We couldn’t process your latest payment. Update your payment method to keep RidePicker
              active.
            </p>
          </div>
          <button
            onClick={updatePm}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" /> Update payment method
          </button>
        </Card>
      )}

      {status === "cancelled" && (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-900">{PLAN_NAME}</div>
              <div className="mt-0.5 text-sm text-slate-500">{PRICE_LABEL}</div>
            </div>
            <StatusPill tone="cancelled">
              <XCircle className="h-3.5 w-3.5" /> Cancelled
            </StatusPill>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">Subscription cancelled</div>
            {subscription.activeUntil && new Date(subscription.activeUntil) > new Date() ? (
              <p className="mt-1 text-sm text-slate-600">
                RidePicker remains active until{" "}
                <span className="font-medium text-slate-900">
                  {format(new Date(subscription.activeUntil), "d MMM yyyy")}
                </span>
                .
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">Your paid period has ended.</p>
            )}
          </div>

          <button
            onClick={reactivate}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Reactivate
          </button>
        </Card>
      )}

      <DemoControls
        status={status}
        onMarkPaid={markPaid}
        onFail={fail}
        onCancel={cancel}
        onReactivate={reactivate}
        onReset={reset}
      />
    </div>
  );
}

function Card({ children }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5">{children}</section>;
}

function PlanHeader() {
  return (
    <div>
      <div className="text-base font-semibold text-slate-900">{PLAN_NAME}</div>
      <div className="mt-0.5 text-sm text-slate-500">{PRICE_LABEL}</div>
    </div>
  );
}

function StatusPill({ tone, children }) {
  const tones = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.cancelled}`}
    >
      {children}
    </span>
  );
}

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

function InvoiceHistory({ invoices }) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Receipt className="h-4 w-4 text-slate-400" /> Invoice history
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(invoices || []).map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 text-slate-700">{format(new Date(inv.date), "d MMM yyyy")}</td>
                <td className="px-4 py-3 text-slate-700">€{inv.amount}</td>
                <td className="px-4 py-3">
                  <InvoiceStatus status={inv.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toast({ title: "Demo invoice", description: inv.id })}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700"
                  >
                    <Download className="h-4 w-4" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceStatus({ status }) {
  if (status === "paid")
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Paid
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-rose-600">
        <AlertTriangle className="h-3.5 w-3.5" /> Failed
      </span>
    );
  return <span className="text-slate-500">{status}</span>;
}

function DemoControls({ status, onMarkPaid, onFail, onCancel, onReactivate, onReset }) {
  if (!config.enableDevTools) return null;
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Demo controls — mock billing
      </div>
      <p className="mt-1 text-sm text-slate-500">
        These controls simulate billing events so every state can be previewed. They will be removed
        when real billing is connected.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {status !== "active" && (
          <DemoButton onClick={onMarkPaid}>Mark as paid</DemoButton>
        )}
        {status === "active" && (
          <DemoButton onClick={onFail}>Simulate payment failure</DemoButton>
        )}
        {status === "active" && (
          <DemoButton onClick={onCancel}>Cancel subscription</DemoButton>
        )}
        {status === "cancelled" && (
          <DemoButton onClick={onReactivate}>Reactivate</DemoButton>
        )}
        <DemoButton onClick={onReset} tone="ghost">Reset</DemoButton>
      </div>
    </section>
  );
}

function DemoButton({ children, onClick, tone }) {
  const cls =
    tone === "ghost"
      ? "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}