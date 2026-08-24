import { useEffect, useState } from "react";
import {
  BadgePoundSterling,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { preferencesApi } from "@/lib/services/api/preferencesApi";

const MIN_PRICE = 0;
const MAX_PRICE = 300;
const PRICE_STEP = 5;

function toSliderPrice(value) {
  if (value === null || value === undefined || value === "") return MIN_PRICE;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= MIN_PRICE) return MIN_PRICE;
  const stepped = Math.round(parsed / PRICE_STEP) * PRICE_STEP;
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, stepped));
}

function formatMinimumPrice(value) {
  if (value <= MIN_PRICE) return "Any price";
  if (value >= MAX_PRICE) return `£${MAX_PRICE}+`;
  return `£${value}+`;
}

export default function AssistPricePreferenceCard({ enabled, userId }) {
  const { toast } = useToast();
  const [minimumPrice, setMinimumPrice] = useState(MIN_PRICE);
  const [savedMinimumPrice, setSavedMinimumPrice] = useState(MIN_PRICE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      setMinimumPrice(MIN_PRICE);
      setSavedMinimumPrice(MIN_PRICE);
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
        const next = toSliderPrice(preferences?.minimumJobPrice);
        setMinimumPrice(next);
        setSavedMinimumPrice(next);
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

  const dirty = minimumPrice !== savedMinimumPrice;
  const controlsDisabled = !enabled || loading || Boolean(loadError);

  const saveMinimumPrice = async () => {
    if (!enabled || !userId || !dirty || saving || loadError) return;

    setSaving(true);
    try {
      const preferences = await preferencesApi.update(userId, {
        minimumJobPrice: minimumPrice <= MIN_PRICE ? null : minimumPrice,
      });
      const next = toSliderPrice(preferences?.minimumJobPrice);
      setMinimumPrice(next);
      setSavedMinimumPrice(next);
      toast({
        title: "Price preference saved",
        description:
          next <= MIN_PRICE
            ? "Assist can consider jobs at any price."
            : `Minimum job price is now ${formatMinimumPrice(next)}.`,
      });
    } catch (error) {
      toast({
        title: "Could not save price preference",
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
            <BadgePoundSterling className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className={`text-sm font-semibold ${enabled ? "text-slate-900" : "text-slate-500"}`}>
              Price preference
            </h2>
            <p className={`mt-1 text-sm leading-5 ${enabled ? "text-slate-500" : "text-slate-400"}`}>
              Choose the minimum job price you want Assist to care about.
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
            enabled ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
          }`}
        >
          {loading ? "…" : formatMinimumPrice(minimumPrice)}
        </span>
      </div>

      {loadError ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError?.message || "Could not load saved price preference."}</span>
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
          <Loader2 className="h-4 w-4 animate-spin" /> Loading saved price preference…
        </div>
      ) : (
        <fieldset disabled={controlsDisabled} className={!enabled ? "select-none opacity-50" : ""}>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Minimum job price</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Move the bar right to ignore lower-value jobs.
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold tabular-nums text-slate-900">
                  {formatMinimumPrice(minimumPrice)}
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  selected
                </div>
              </div>
            </div>

            <div className="mt-5 px-1">
              <Slider
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={[minimumPrice]}
                onValueChange={(value) => setMinimumPrice(value[0] ?? MIN_PRICE)}
                disabled={controlsDisabled || saving}
                aria-label="Minimum job price"
              />

              <div className="mt-3 grid grid-cols-4 text-xs font-medium tabular-nums text-slate-400">
                <span>Any</span>
                <span className="text-center">£100</span>
                <span className="text-center">£200</span>
                <span className="text-right">£300+</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {dirty ? (
                <span className="font-medium text-amber-600">Unsaved changes</span>
              ) : savedMinimumPrice <= MIN_PRICE ? (
                "Any job price is currently allowed"
              ) : (
                `Saved minimum: ${formatMinimumPrice(savedMinimumPrice)}`
              )}
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              {dirty && (
                <button
                  type="button"
                  onClick={() => setMinimumPrice(savedMinimumPrice)}
                  disabled={saving}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={saveMinimumPrice}
                disabled={!dirty || saving}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save price"}
              </button>
            </div>
          </div>
        </fieldset>
      )}
    </section>
  );
}
