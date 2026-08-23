import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function formatPairingCode(value) {
  const compact = String(value || "").replace(/\s+/g, "");
  if (!compact) return "";
  return compact.match(/.{1,4}/g)?.join(" ") || compact;
}

function secondsUntil(value) {
  if (!value) return null;
  const ms = new Date(value).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.ceil(ms / 1000));
}

function expiryLabel(seconds) {
  if (seconds === null) return null;
  if (seconds <= 0) return "Code may have expired";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `Code shown for ${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function WhatsappPairingCard({
  status,
  pairingCode,
  loginPhone,
  onStart,
  onRefreshCode,
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(() => secondsUntil(pairingCode?.displayExpiresAt));

  const code = pairingCode?.code || "";
  const formattedCode = useMemo(() => formatPairingCode(code), [code]);
  const phone = pairingCode?.phone || loginPhone || null;
  const expired = remaining === 0;

  useEffect(() => {
    setRemaining(secondsUntil(pairingCode?.displayExpiresAt));
    if (!pairingCode?.displayExpiresAt) return undefined;

    const timer = window.setInterval(() => {
      setRemaining(secondsUntil(pairingCode.displayExpiresAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [pairingCode?.displayExpiresAt]);

  useEffect(() => {
    setCopied(false);
  }, [code]);

  const run = async (fn) => {
    if (!fn || busy) return;
    setBusy(true);
    try {
      await fn();
    } catch {
      // The page-level handler shows the user-facing error toast.
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(String(code).replace(/\s+/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const loading = status === "loading";
  const disconnected = status === "disconnected" || status === "logged_out";
  const canGenerate = (disconnected || status === "qr") && !code;
  const preparing = status === "starting" && !code;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
        <MessageCircle className="h-4 w-4 text-emerald-600" /> Connect WhatsApp
      </div>
      <p className="mt-1 text-sm text-slate-500">
        RidePicker uses the phone number from your account to request a WhatsApp connection code.
      </p>

      {loading ? (
        <div className="mt-5 flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <div className="mt-3 text-sm font-medium text-slate-700">Checking WhatsApp connection…</div>
        </div>
      ) : canGenerate ? (
        <div className="mt-5">
          {phone && (
            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Phone number</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{phone}</div>
            </div>
          )}
          <button
            onClick={() => run(onStart)}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
            Generate connection code
          </button>
          {status === "logged_out" && (
            <p className="mt-3 text-xs text-slate-400">The previous WhatsApp session was disconnected.</p>
          )}
        </div>
      ) : preparing ? (
        <div className="mt-5 flex min-h-[230px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
          <div className="mt-3 text-sm font-medium text-slate-700">Generating your connection code…</div>
          <div className="mt-1 text-xs text-slate-400">This normally takes up to 10 seconds.</div>
        </div>
      ) : code ? (
        <div className="mt-5">
          <div className={cn("rounded-xl border p-5 text-center", expired ? "border-amber-200 bg-amber-50" : "border-emerald-100 bg-emerald-50/60")}>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              WhatsApp connection code
            </div>
            <div className="mt-3 font-mono text-3xl font-bold tracking-[0.16em] text-slate-950 tabular-nums sm:text-4xl">
              {formattedCode}
            </div>
            {phone && <div className="mt-2 text-xs text-slate-500">For {phone}</div>}

            <button
              type="button"
              onClick={copyCode}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className={cn("h-2 w-2 rounded-full", expired ? "bg-amber-500" : "animate-pulse bg-emerald-500")} />
            <span>{expired ? "Generate a new code before linking" : "Waiting for WhatsApp connection…"}</span>
          </div>

          {expiryLabel(remaining) && (
            <div className={cn("mt-1 text-center text-xs", expired ? "text-amber-700" : "text-slate-400")}>
              {expiryLabel(remaining)}
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => run(onRefreshCode || onStart)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Generate new code
            </button>
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-3.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p className="text-xs leading-5 text-slate-500">
              Keep this code private. Only enter it inside WhatsApp on your own phone.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          WhatsApp did not return a connection code. Generate a new one and try again.
        </div>
      )}
    </div>
  );
}
