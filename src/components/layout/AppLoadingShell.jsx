// A predictable app-shell placeholder while authenticated account data hydrates.
// Never show disconnected or onboarding states before the first session check.
export default function AppLoadingShell() {
  return (
    <div role="status" aria-label="Loading RidePicker account" aria-live="polite" className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white sm:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">R</div>
          <span className="text-base font-semibold tracking-tight text-slate-900">RidePicker</span>
        </div>
        <div className="space-y-4 px-5 pt-5">
          {[132, 86, 110, 108, 94].map((width, index) => (
            <div key={index} className="h-4 animate-pulse rounded bg-slate-100" style={{ width }} />
          ))}
        </div>
        <div className="mt-auto space-y-3 px-5 pb-8">
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-8 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      </aside>
      <div className="sm:pl-60">
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:hidden">
          <span className="font-semibold text-slate-900">RidePicker</span>
        </div>
        <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-8 sm:py-8">
          <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white p-5">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-3 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />)}
          </div>
          <p className="text-sm text-slate-500">Loading your RidePicker workspace…</p>
        </main>
      </div>
    </div>
  );
}
