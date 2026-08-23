import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import { greeting } from "@/lib/format";
import JobRow from "@/components/JobRow";

export default function OperationalState({ onOpenJob }) {
  const { user, jobs } = useProduct();
  const name = user?.full_name?.split(" ")[0];
  const latest = jobs.slice(0, 6);
  const stats = computeStats(jobs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          {greeting()}{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">RidePicker is active and monitoring your messages.</p>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
        <Stat label="Jobs detected today" value={stats.today} />
        <Stat label="Jobs contacted" value={stats.contacted} />
        <Stat label="Jobs won" value={stats.won} />
        <Stat label="Potential value" value={`£${stats.value}`} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Latest jobs</h2>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-0.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [&>button:last-child]:border-b-0">
          {latest.map((j) => (
            <JobRow key={j.id} job={j} onClick={() => onOpenJob(j)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{value}</div>
    </div>
  );
}

function computeStats(jobs) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = jobs.filter((j) => new Date(j.detectedAt) >= todayStart).length;
  const contacted = jobs.filter((j) =>
    ["contacted", "interested", "negotiating", "won"].includes(j.status)
  ).length;
  const won = jobs.filter((j) => j.status === "won").length;
  const value = jobs
    .filter((j) => j.status !== "lost" && j.status !== "ignored")
    .reduce((s, j) => s + j.price, 0);
  return { today, contacted, won, value };
}