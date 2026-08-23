const STEPS = [
  {
    n: 1,
    title: "Generate your code",
    desc: "RidePicker uses the phone number you signed in with.",
  },
  {
    n: 2,
    title: "Enter it in WhatsApp",
    desc: "Open Linked Devices → Link a device → Link with phone number.",
  },
  {
    n: 3,
    title: "Enable RidePicker",
    desc: "Once connected, turn on monitoring and new jobs will appear automatically.",
  },
];

export default function GettingStarted() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-medium text-slate-900">Getting started</div>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step) => (
          <li key={step.n} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold text-slate-500">
              {step.n}
            </span>
            <div>
              <div className="text-sm font-medium text-slate-900">{step.title}</div>
              <div className="text-sm text-slate-500">{step.desc}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
