import { useState } from "react";
import { BadgePoundSterling } from "lucide-react";

const MIN_PRICE = 0;
const MAX_PRICE = 300;
const PRICE_STEP = 5;

function formatMinimumPrice(value) {
  if (value <= MIN_PRICE) return "Any price";
  if (value >= MAX_PRICE) return `£${MAX_PRICE}+`;
  return `£${value}+`;
}

export default function AssistPricePreferenceCard({ enabled }) {
  const [minimumPrice, setMinimumPrice] = useState(MIN_PRICE);
  const progress = ((minimumPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

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
          {formatMinimumPrice(minimumPrice)}
        </span>
      </div>

      <fieldset disabled={!enabled} className={!enabled ? "select-none opacity-50" : ""}>
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

          <div className="mt-5">
            <div className="relative h-2 rounded-full bg-slate-200">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-slate-900"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
              />
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={minimumPrice}
                onChange={(event) => setMinimumPrice(Number(event.target.value))}
                aria-label="Minimum job price"
                aria-valuetext={formatMinimumPrice(minimumPrice)}
                className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent accent-slate-900 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mt-3 grid grid-cols-4 text-xs font-medium tabular-nums text-slate-400">
              <span>Any</span>
              <span className="text-center">£100</span>
              <span className="text-center">£200</span>
              <span className="text-right">£300+</span>
            </div>
          </div>
        </div>
      </fieldset>
    </section>
  );
}
