import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { ArrowRight } from "lucide-react";
import ExampleTransform from "@/components/ExampleTransform";
import ProductFlow from "@/components/ProductFlow";

export default function Landing() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (!isLoadingAuth && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <span className="text-sm font-bold">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900">RidePicker</span>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link to="/login" className="font-medium text-slate-900 hover:text-slate-700">
            Log in
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-8 sm:pt-14">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI dispatcher for WhatsApp jobs
          </div>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Your AI dispatcher for WhatsApp jobs.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            RidePicker finds opportunities, follows up and helps secure work on your behalf —
            even while you're driving, busy or asleep.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/learn-more"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Learn more
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            You stay in control. RidePicker only works while you enable it.
          </p>
          <div className="mt-3 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-slate-900 hover:underline">
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            How a WhatsApp message becomes a job
          </div>
          <ExampleTransform />
          <ProductFlow />
        </div>
      </main>
    </div>
  );
}