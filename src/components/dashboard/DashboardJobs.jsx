import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import JobRow from "@/components/JobRow";

// Upcoming & latest jobs. Soonest pickup first.
export default function DashboardJobs({ onOpenJob }) {
  const { jobs } = useProduct();
  const now = new Date();
  const sorted = [...jobs].sort((a, b) => {
    const ta = new Date(a.pickupTime);
    const tb = new Date(b.pickupTime);
    const aFuture = ta >= now;
    const bFuture = tb >= now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return aFuture ? ta - tb : tb - ta;
  });
  const list = sorted.slice(0, 6);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Upcoming & latest jobs</h2>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-0.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [&>button:last-child]:border-b-0">
        {list.map((j) => (
          <JobRow key={j.id} job={j} onClick={() => onOpenJob(j)} />
        ))}
      </div>
    </div>
  );
}