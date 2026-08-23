import { useState } from "react";
import {
  Activity as ActivityIcon,
  Briefcase,
  Loader2,
  MessageCircle,
  Power,
  Trash2,
  Wifi,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { formatRelative } from "@/lib/format";
import { useProduct } from "@/lib/product/ProductContext";
import { activityService } from "@/lib/services/activityService";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const { activity, whatsappConnected, botActive } = useProduct();
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filtered = activity.filter((e) => filter === "all" || e.type === filter);
  const has = activity.length > 0;

  const deleteActivity = async () => {
    const target = deleteTarget;
    if (!target || !user?.id || deletingId) return;

    setDeletingId(target.id);
    try {
      if (typeof activityService.remove !== "function") {
        throw new Error("Activity deletion is not available in this environment.");
      }
      await activityService.remove(user.id, target.id);
      setDeleteTarget(null);
      toast({
        title: "Activity deleted",
        description:
          target.type === "message"
            ? "Removed from the Activity timeline. The underlying WhatsApp message was preserved."
            : "The activity entry was removed.",
      });
    } catch (error) {
      toast({
        title: "Could not delete activity",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  let empty;
  if (!has) {
    if (!whatsappConnected) {
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Activity</h1>
          <p className="mt-1 text-sm text-slate-500">A live timeline of what RidePicker has been doing.</p>
        </div>
        <div className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </div>
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
                  const isDeleting = deletingId === e.id;
                  return (
                    <div
                      key={e.id}
                      className="group flex gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900">{e.title}</div>
                        {e.detail && <div className="break-words text-sm text-slate-500">{e.detail}</div>}
                        <div className="mt-0.5 text-xs text-slate-400">
                          {formatRelative(e.time)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(e)}
                        disabled={Boolean(deletingId)}
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 sm:text-slate-300"
                        aria-label={`Delete ${e.title || "activity"}`}
                        title="Delete activity"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this activity?"
        description={
          deleteTarget?.type === "message"
            ? "This removes the item from Activity only. The underlying WhatsApp message and any job context stay intact."
            : "This permanently removes the activity entry from your timeline."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={deleteActivity}
        onCancel={() => {
          if (!deletingId) setDeleteTarget(null);
        }}
      />
    </div>
  );
}