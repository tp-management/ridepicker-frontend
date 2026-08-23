import { useState } from "react";
import { Briefcase, MessageCircle, Power, Wifi, AlertTriangle, Activity as ActivityIcon } from "lucide-react";
import { useProduct } from "@/lib/product/ProductContext";
import { formatRelative } from "@/lib/format";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "job", label: "Jobs" },
  { key: "message", label: "Messages" },
  { key: "ridepicker", label: "RidePicker" },
  { key: "whatsapp", label: "WhatsApp" },
];

const ICONS = {
  job: Briefcase,
  message: MessageCircle,
  ridepicker: Power,
  whatsapp: Wifi,
};

export default function Activity() {
  const { activity, activityError, whatsappConnected, botActive } = useProduct();
  const [filter, setFilter] = useState("all");
  const filtered = activity.filter((e) => filter === "all" || e.type === filter);
  const has = activity.length > 0;

  let empty;
  if (!has) {
    if (activityError) {
      empty = (
        <EmptyState
          icon={AlertTriangle}
          title="Could not load activity"
          description="RidePicker could not read your activity right now. Refresh the page or sign in again."
        />
      );
    } else if (!whatsappConnected) {
      empty = (
        <EmptyState
          icon={MessageCircle}
          title="No activity yet"
          description="Connect WhatsApp and enable RidePicker to start seeing activity."
        />
      );
    } else if (!botActive) {
      empty = (
        <EmptyState
          icon={Power}
          title="RidePicker is off"
          description="Enable RidePicker to start monitoring and recording activity."
        />
      );
    } else {
      empty = (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          description="RidePicker is monitoring. Activity from detected jobs and messages will appear here."
        />
      );
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Activity</h1>
        <p className="mt-1 text-sm text-slate-500">A timeline of what RidePicker has been doing.</p>
      </div>

      {has ? (
        <>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === f.key
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="[&>*:last-child]:border-b-0">
              {filtered.length ? (
                filtered.map((e) => {
                  const Icon = ICONS[e.type] ?? ActivityIcon;
                  return (
                    <div
                      key={e.id}
                      className="flex gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900">{e.title}</div>
                        {e.detail && <div className="text-sm text-slate-500">{e.detail}</div>}
                        <div className="mt-0.5 text-xs text-slate-400">
                          {formatRelative(e.time)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState icon={ActivityIcon} title="No activity matches this filter" />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">{empty}</div>
      )}
    </div>
  );
}
