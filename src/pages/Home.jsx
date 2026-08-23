import { useState } from "react";
import { useProduct } from "@/lib/product/ProductContext";
import JobDetailPanel from "@/components/JobDetailPanel";
import ConnectState from "@/components/home/ConnectState";
import StatusBanner from "@/components/dashboard/StatusBanner";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import NeedsAttention from "@/components/dashboard/NeedsAttention";
import RidePickerSummary from "@/components/dashboard/RidePickerSummary";
import DashboardJobs from "@/components/dashboard/DashboardJobs";
import { greeting } from "@/lib/format";

export default function Home() {
  const {
    user,
    jobs,
    whatsappConnected,
    demoMode,
    enableDemo,
    changeJobStatus,
    setJobPayment,
    addExpense,
    removeExpense,
  } = useProduct();
  const [selected, setSelected] = useState(null);
  const [period, setPeriod] = useState("week");

  const hasJobs = jobs.length > 0;
  const name = user?.full_name?.split(" ")[0];

  const handleStatusChange = (id, status) => {
    changeJobStatus(id, status);
    setSelected((p) => (p && p.id === id ? { ...p, status } : p));
  };
  const handlePayment = (id, patch) => {
    setJobPayment(id, patch);
    setSelected((p) => (p && p.id === id ? { ...p, ...patch } : p));
  };
  const handleAddExpense = (id, expense) => {
    addExpense(id, expense);
    setSelected((p) => (p && p.id === id ? { ...p, expenses: [...(p.expenses || []), expense] } : p));
  };
  const handleRemoveExpense = (id, expenseId) => {
    removeExpense(id, expenseId);
    setSelected((p) =>
      p && p.id === id ? { ...p, expenses: (p.expenses || []).filter((e) => e.id !== expenseId) } : p
    );
  };

  // Brand-new user with no WhatsApp and no historical jobs: onboarding.
  if (!whatsappConnected && !hasJobs && !demoMode) {
    return <ConnectState onPreviewDemo={enableDemo} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          {greeting()}{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Your RidePicker dashboard.</p>
      </div>

      <StatusBanner />

      {hasJobs ? (
        <>
          <FinancialOverview period={period} onPeriod={setPeriod} />
          <NeedsAttention />
          <RidePickerSummary period={period} />
          <DashboardJobs onOpenJob={setSelected} />
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            No jobs detected yet. Turn on RidePicker to start monitoring new messages.
          </p>
        </div>
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