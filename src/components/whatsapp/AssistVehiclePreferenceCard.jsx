import { useEffect, useState } from "react";
import { CarFront, Check, Loader2, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { preferencesApi } from "@/lib/services/api/preferencesApi";

export const ASSIST_VEHICLE_OPTIONS = [
  {
    id: "saloon",
    label: "Saloon",
    description: "Standard saloon jobs",
  },
  {
    id: "estate",
    label: "Estate",
    description: "Estate / wagon jobs",
  },
  {
    id: "mpv",
    label: "MPV",
    description: "MPV and MPV6-style jobs",
  },
  {
    id: "8_seater",
    label: "8 Seater",
    description: "Also covers 7/9 seater and minivan wording",
  },
];

const VALID_VEHICLES = new Set(ASSIST_VEHICLE_OPTIONS.map((option) => option.id));

function normalizeVehicleTypes(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).filter((item) => VALID_VEHICLES.has(item)))];
}

function sameSelection(a, b) {
  if (a.length !== b.length) return false;
  const right = new Set(b);
  return a.every((value) => right.has(value));
}

function safeRules(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export default function AssistVehiclePreferenceCard({ enabled, userId }) {
  const { toast } = useToast();
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [savedVehicleTypes, setSavedVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      setVehicleTypes([]);
      setSavedVehicleTypes([]);
      setLoading(false);
      setLoadError(null);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setLoadError(null);

    preferencesApi
      .get(userId)
      .then((preferences) => {
        if (!active) return;
        const next = normalizeVehicleTypes(preferences?.autopilotRules?.assistVehicleTypes);
        setVehicleTypes(next);
        setSavedVehicleTypes(next);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  const dirty = !sameSelection(vehicleTypes, savedVehicleTypes);
  const controlsDisabled = !enabled || loading || Boolean(loadError);

  const toggleVehicle = (vehicleId) => {
    if (controlsDisabled || saving) return;
    setVehicleTypes((current) =>
      current.includes(vehicleId)
        ? current.filter((item) => item !== vehicleId)
        : [...current, vehicleId]
    );
  };

  const saveVehicleTypes = async () => {
    if (!enabled || !userId || !dirty || saving || loadError) return;

    setSaving(true);
    try {
      // Merge with the latest rules object so this Assist preference never
      // overwrites unrelated future autopilot settings.
      const latest = await preferencesApi.get(userId);
      const latestRules = safeRules(latest?.autopilotRules);
      const preferences = await preferencesApi.update(userId, {
        autopilotRules: {
          ...latestRules,
          assistVehicleTypes: vehicleTypes,
        },
      });

      const next = normalizeVehicleTypes(preferences?.autopilotRules?.assistVehicleTypes);
      setVehicleTypes(next);
      setSavedVehicleTypes(next);
      toast({
        title: "Vehicle preference saved",
        description: next.length
          ? `${next.length} vehicle type${next.length === 1 ? "" : "s"} selected for Assist.`
          : "No vehicle filter is active. Assist can consider any vehicle type.",
      });
    } catch (error) {
      toast({
        title: "Could not save vehicle preference",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-disabled={!enabled}
      className={`rounded-xl border p-4 transition-colors sm:p-5 ${
        enabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-100/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              enabled ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
            }`}
          >
            <CarFront className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className={`text-sm font-semibold ${enabled ? "text-slate-900" : "text-slate-500"}`}>
              Vehicle preference
            </h2>
            <p className={`mt-1 text-sm leading-5 ${enabled ? "text-slate-500" : "text-slate-400"}`}>
              Pick which vehicle jobs you want Assist to keep.
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            enabled ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"
          }`}
        >
          {loading ? "…" : vehicleTypes.length ? `${vehicleTypes.length} selected` : "Any vehicle"}
        </span>
      </div>

      {loadError ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError?.message || "Could not load saved vehicle preference."}</span>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : loading ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading saved vehicle preference…
        </div>
      ) : (
        <fieldset disabled={controlsDisabled} className={!enabled ? "select-none opacity-50" : ""}>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Vehicle types</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Select one or several. Leave all unchecked to allow any vehicle type.
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ASSIST_VEHICLE_OPTIONS.map((option) => {
                const selected = vehicleTypes.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleVehicle(option.id)}
                    aria-pressed={selected}
                    className={`flex min-h-16 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected ? "border-white/30 bg-white/15" : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className={`mt-0.5 block text-xs ${selected ? "text-slate-300" : "text-slate-400"}`}>
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {dirty ? (
                <span className="font-medium text-amber-600">Unsaved changes</span>
              ) : savedVehicleTypes.length ? (
                `${savedVehicleTypes.length} vehicle type${savedVehicleTypes.length === 1 ? "" : "s"} saved`
              ) : (
                "Any vehicle type is currently allowed"
              )}
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              {dirty && (
                <button
                  type="button"
                  onClick={() => setVehicleTypes(savedVehicleTypes)}
                  disabled={saving}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={saveVehicleTypes}
                disabled={!dirty || saving}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save vehicles"}
              </button>
            </div>
          </div>
        </fieldset>
      )}
    </section>
  );
}
