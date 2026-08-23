import { ArrowRight, Clock, PoundSterling, Car } from "lucide-react";

export default function ExampleTransform() {
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-xs font-medium text-slate-400">WhatsApp message</div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
          LGW → Mayfair
          <br />
          Tonight 22:30
          <br />
          £95
          <br />
          E-Class required
        </p>
      </div>

      <div className="flex justify-center text-slate-300">
        <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-xs font-medium text-slate-400">RidePicker job</div>
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          Gatwick Airport <ArrowRight className="h-3.5 w-3.5 text-slate-400" /> Mayfair
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
          <Info icon={Clock} label="Time" value="Tonight 22:30" />
          <Info icon={PoundSterling} label="Price" value="£95" />
          <Info icon={Car} label="Vehicle" value="E-Class" />
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Status:</span>
            <span className="font-medium text-slate-900">New</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}