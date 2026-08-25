import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, MessageCircle, Power, AlertTriangle } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import { useToast } from "@/components/ui/use-toast";
import JobRow from "@/components/JobRow";
import JobDetailPanel from "@/components/JobDetailPanel";
import EmptyState from "@/components/EmptyState";
import { config } from "@/lib/config";

const STATUSES = ["new", "interested", "contacted", "negotiating", "won", "completed", "lost", "ignored"];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

function initialFilters() {
  const params = new URLSearchParams(window.location.search);
  const attention = params.get("attention");
  if (attention === "completed_unpaid")
    return { status: "completed", payment: "unpaid", time: "all", noPrice: false };
  if (attention === "no_price") return { status: "all", payment: "all", time: "all", noPrice: true };
  return {
    status: params.get("status") || "all",
    payment: params.get("payment") || "all",
    time: "all",
    noPrice: false,
  };
}

export default function Jobs() {
  const {
    jobs,
    whatsappConnected,
    mode,
    changeJobStatus,
    setJobPayment,
    addExpense,
    removeExpense,
    enableDemo,
  } = useProduct();
  const { toast } = useToast();
  const init = useMemo(initialFilters, []);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(init.status);
  const [payment, setPayment] = useState(init.payment);
  const [time, setTime] = useState(init.time);
  const [noPrice, setNoPrice] = useState(init.noPrice);
  const [sort, setSort] = useState("newest");

  const now = new Date();
  const filtered = useMemo(() => {
    const list = jobs.filter((j) => {
      if (status !== "all" && j.status !== status) return false;
      if (payment === "paid" && j.paymentStatus !== "paid") return false;
      if (payment === "unpaid" && j.paymentStatus !== "unpaid") return false;
      if (time === "upcoming" && !(new Date(j.pickupTime) >= now)) return false;
      if (time === "completed" && !(new Date(j.pickupTime) < now)) return false;
      if (noPrice && j.price) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!`${j.pickup} ${j.dropoff} ${j.source} ${j.sender ?? ""}`.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
    return [...list].sort((a, b) =>
      sort === "price_desc"
        ? (b.price || 0) - (a.price || 0)
        : sort === "price_asc"
        ? (a.price || 0) - (b.price || 0)
        : new Date(a.pickupTime) - new Date(b.pickupTime)
    );
  }, [jobs, status, payment, time, noPrice, query, sort]);

  const showWriteError = (title, error) => {
    toast({
      title,
      description: error?.message || "The change was not saved. Please try again.",
      variant: "destructive",
    });
  };

  const handleStatusChange = async (id, st) => {
    try {
      const updated = await changeJobStatus(id, st);
      if (updated) setSelected((current) => (current?.id === id ? updated : current));
      return updated;
    } catch (error) {
      showWriteError("Job status was not changed", error);
      return null;
    }
  };

  const handlePayment = async (id, patch) => {
    try {
      const updated = await setJobPayment(id, patch);
      if (updated) setSelected((current) => (current?.id === id ? updated : current));
      return updated;
    } catch (error) {
      showWriteError("Payment change was not saved", error);
      return null;
    }
  };

  const handleAddExpense = async (id, expense) => {
    try {
      const updated = await addExpense(id, expense);
      if (updated) setSelected((current) => (current?.id === id ? updated : current));
      return updated;
    } catch (error) {
      showWriteError("Expense was not added", error);
      return null;
    }
  };

  const handleRemoveExpense = async (id, expenseId) => {
    try {
      const updated = await removeExpense(id, expenseId);
      if (updated) setSelected((current) => (current?.id === id ? updated : current));
      return updated;
    } catch (error) {
      showWriteError("Expense was not removed", error);
      return null;
    }
  };

  const hasJobs = jobs.length > 0;
  const showBanner = hasJobs && (!whatsappConnected || mode === "off");

  let empty;
  if (!hasJobs) {
    if (!whatsappConnected) {
      empty = (
        <EmptyState
          icon={MessageCircle}
          title="Connect WhatsApp to start"
          description="RidePicker needs a WhatsApp connection to detect jobs."
          action={
            <Link
              to="/whatsapp"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Connect WhatsApp
            </Link>
          }
        />
      );
    } else if (mode === "off") {
      empty = (
        <EmptyState
          icon={Power}
          title="RidePicker is off"
          description="Enable RidePicker from the dashboard to start monitoring new messages and detecting jobs."
          action={
            <Link
              to="/home"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Go to dashboard
            </Link>
          }
        />
      );
    } else {
      empty = (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          description="RidePicker is monitoring your WhatsApp messages. Detected driving jobs will appear here automatically."
          action={
            config.enableDevTools ? (
              <button onClick={enableDemo} className="text-sm font-medium text-slate-500 hover:text-slate-900">
                Preview with demo data
              </button>
            ) : null
          }
        />
      );
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Driving jobs detected from your WhatsApp conversations.
        </p>
      </div>

      {showBanner && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {!whatsappConnected
              ? "WhatsApp is not connected — new jobs won't be detected."
              : "RidePicker is paused — new messages are not being monitored."}
          </div>
          <Link
            to={whatsappConnected ? "/home" : "/whatsapp"}
            className="shrink-0 text-sm font-medium text-amber-800 underline"
          >
            {whatsappConnected ? "Turn on" : "Connect"}
          </Link>
        </div>
      )}

      {hasJobs ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search route, source, sender…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={status} onChange={setStatus}>
                <option value="all">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {cap(s)}
                  </option>
                ))}
              </Select>
              <Select value={payment} onChange={setPayment}>
                <option value="all">All payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </Select>
              <Select value={time} onChange={setTime}>
                <option value="all">All pickup times</option>
                <option value="upcoming">Upcoming pickup</option>
                <option value="completed">Past pickup</option>
              </Select>
              <Select value={sort} onChange={setSort}>
                <option value="newest">Pickup time</option>
                <option value="price_desc">Price: high to low</option>
                <option value="price_asc">Price: low to high</option>
              </Select>
            </div>
          </div>

          {noPrice && (
            <div className="text-xs text-slate-500">
              Showing jobs with no confirmed price.{" "}
              <button onClick={() => setNoPrice(false)} className="font-medium text-slate-700 underline">
                Clear
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden grid-cols-[1.6fr_1fr_1.1fr_1fr_1fr_auto] gap-4 border-b border-slate-200 px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-400 sm:grid">
              <div>Route</div>
              <div>Pickup</div>
              <div>Price</div>
              <div>Vehicle</div>
              <div>Source</div>
              <div className="text-right">Status</div>
            </div>
            <div className="[&>button:last-child]:border-b-0">
              {filtered.length ? (
                filtered.map((j) => <JobRow key={j.id} job={j} onClick={() => setSelected(j)} />)
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No jobs match your filters"
                  description="Try adjusting the status, payment or search query."
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">{empty}</div>
      )}

      <JobDetailPanel
        job={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onPayment={handlePayment}
        onAddExpense={handleAddExpense}
        onRemoveExpense={handleRemoveExpense}
      />
    </div>
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
    >
      {children}
    </select>
  );
}
