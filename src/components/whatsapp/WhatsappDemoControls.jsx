import { config } from "@/lib/config";

export default function WhatsappDemoControls({ status, onSimulateDrop, onReset }) {
  if (!config.enableDevTools) return null;
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Demo controls — mock WhatsApp session
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Simulates the RidePicker backend session lifecycle. Removed when the real API is connected.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {status === "connected" && (
          <button
            onClick={onSimulateDrop}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Simulate connection drop
          </button>
        )}
        <button
          onClick={onReset}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          Reset session
        </button>
      </div>
    </section>
  );
}