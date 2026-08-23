import { Link } from "react-router-dom";
import { ArrowRight, Power, MessageCircle, Eye, Check, Moon } from "lucide-react";
import JobLifecycle from "@/components/JobLifecycle";

const MODES = [
  {
    key: "Off",
    icon: Power,
    desc: "RidePicker is inactive. Nothing is monitored.",
  },
  {
    key: "Assist",
    icon: Eye,
    desc: "Monitors new messages, detects jobs and alerts you. You decide what to do.",
  },
  {
    key: "Autopilot",
    icon: MessageCircle,
    desc: "Also contacts senders, follows up and negotiates within your rules.",
    soon: true,
  },
];

const NIGHT = [
  { time: "02:14", text: 'A job appears in "London Chauffeur Jobs": LGW → Mayfair, 06:30, £95, E-Class.' },
  { time: "02:14", text: "RidePicker detects the opportunity and evaluates it against your preferences." },
  { time: "02:15", text: "RidePicker contacts the sender and confirms you're available.", soon: true },
  { time: "06:00", text: "You wake up to a notification: a £95 job to Mayfair is lined up for 06:30." },
];

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <span className="text-sm font-bold">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900">RidePicker</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="font-medium text-slate-600 hover:text-slate-900">Log in</Link>
          <Link to="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Your 24/7 AI dispatcher
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          RidePicker doesn't just parse WhatsApp messages. It keeps looking for work and handling
          opportunities on your behalf — finding jobs, following up and helping secure work — even
          while you're driving, busy or asleep.
        </p>

        <Section title="Three modes, you choose how far it goes">
          <div className="space-y-3">
            {MODES.map((m) => (
              <div key={m.key} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <m.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {m.key}
                    {m.soon && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="The full job lifecycle">
          <p className="text-slate-600">
            From a message in a chat to a job secured and you notified — here's everything RidePicker
            can handle along the way.
          </p>
          <div className="mt-5">
            <JobLifecycle />
          </div>
        </Section>

        <Section title="An example while you were asleep">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-900">
              <Moon className="h-4 w-4 text-slate-400" /> Autopilot · overnight
            </div>
            <div className="space-y-3">
              {NIGHT.map((n, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-12 shrink-0 font-mono text-xs text-slate-400">{n.time}</span>
                  <p className="text-sm text-slate-600">
                    {n.text}
                    {n.soon && (
                      <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Soon
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="You stay in control">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> RidePicker only works while you enable it.</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> You choose Off, Assist or Autopilot.</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> In Autopilot, RidePicker acts within rules you configure.</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> You're notified about the progress that matters.</li>
          </ul>
        </Section>

        <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-900">
            <MessageCircle className="h-4 w-4 text-emerald-600" /> Ready to try RidePicker?
          </div>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}