import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Info,
  ListFilter,
  LogOut,
  MessageCircle,
  Plus,
  Power,
  RotateCcw,
  Save,
  Search,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useProduct } from "@/lib/product/ProductContext";
import { useRidePickerMode } from "@/lib/product/useRidePickerMode";
import { useToast } from "@/components/ui/use-toast";
import ModeControl from "@/components/ModeControl";
import { config } from "@/lib/config";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_LABEL = {
  none: "Payment required",
  active: "Active",
  past_due: "Payment issue",
  cancelled: "Cancelled",
};
const STATUS_TONE = {
  none: "text-amber-600",
  active: "text-emerald-600",
  past_due: "text-rose-600",
  cancelled: "text-slate-500",
};

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

export default function Settings() {
  const { user } = useAuth();
  const { whatsappConnected, mode, subscription, logout, updateProfile, resetDevData, isDevUser } =
    useProduct();
  const { onMode } = useRidePickerMode();
  const { toast } = useToast();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setEditName(user?.full_name || "");
  }, [user?.full_name]);

  const subStatus = subscription?.status || "none";
  const nextPayment =
    subStatus === "active" && subscription?.nextPaymentDate
      ? `€180 on ${format(new Date(subscription.nextPaymentDate), "d MMM yyyy")}`
      : null;

  const nameChanged = editName.trim() && editName.trim() !== (user?.full_name || "");

  const saveProfile = () => {
    if (!nameChanged) return;
    setSavingProfile(true);
    updateProfile({ name: editName.trim() });
    setTimeout(() => {
      setSavingProfile(false);
      toast({ title: "Profile updated", description: "Your name has been saved." });
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account and RidePicker preferences.</p>
      </div>

      <Section icon={User} title="Profile" summary={user?.full_name || "Account details"}>
        <div className="space-y-3">
          <div>
            <label htmlFor="profile-name" className="text-sm text-slate-500">
              Name
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="profile-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
              />
              <button
                onClick={saveProfile}
                disabled={!nameChanged || savingProfile}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
          <Row label="Email" value={user?.email || "—"} />
          <Row label="Phone" value={user?.phone || "—"} />
        </div>
      </Section>

      <Section
        icon={Power}
        title="RidePicker preferences"
        summary={mode === "assist" ? "Assist" : mode === "autopilot" ? "Autopilot" : "Off"}
      >
        <div className="text-sm font-medium text-slate-900">RidePicker mode</div>
        <div className="text-sm text-slate-500">
          {whatsappConnected
            ? "Choose how actively RidePicker works for you."
            : "Connect WhatsApp to enable RidePicker."}
        </div>
        <div className="mt-3 max-w-sm">
          <ModeControl mode={mode} onMode={onMode} disabled={!whatsappConnected} />
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>
            <span className="font-medium text-slate-900">Off</span> — RidePicker is inactive.
          </li>
          <li>
            <span className="font-medium text-slate-900">Assist</span> — monitors new messages,
            detects jobs and alerts you.
          </li>
          <li>
            <span className="font-medium text-slate-900">Autopilot</span> — also contacts senders,
            follows up and negotiates within your rules.{" "}
            <span className="font-medium text-amber-600">Coming soon.</span>
          </li>
        </ul>
      </Section>

      <Section
        icon={ListFilter}
        title="Assist preferences"
        summary="Message keyword filter"
        defaultOpen
      >
        <AssistFilterPreview />
      </Section>

      <Section
        icon={CreditCard}
        title="Billing"
        summary={`${STATUS_LABEL[subStatus]} · €180 / month`}
      >
        <div className="space-y-0.5">
          <Row label="Plan" value="RidePicker Premium" />
          <Row label="Price" value="€180 / month" />
          <Row
            label="Status"
            value={
              <span className={`font-medium ${STATUS_TONE[subStatus]}`}>{STATUS_LABEL[subStatus]}</span>
            }
          />
          {nextPayment && <Row label="Next payment" value={nextPayment} />}
        </div>
        <div className="mt-4">
          <Link
            to="/billing"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Manage billing <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Section
        icon={MessageCircle}
        title="WhatsApp"
        summary={whatsappConnected ? "Connected" : "Not connected"}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-900">
              {whatsappConnected ? "Connected" : "Not connected"}
            </div>
            <div className="text-sm text-slate-500">
              {whatsappConnected
                ? "RidePicker is linked to your WhatsApp account."
                : "Connect WhatsApp so RidePicker can monitor messages."}
            </div>
          </div>
          <Link
            to="/whatsapp"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {whatsappConnected ? "Manage" : "Connect"} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Section icon={LogOut} title="Account" summary="Sign out and development tools">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setConfirmLogout(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          {config.enableDevTools && isDevUser && (
            <button
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset development data
            </button>
          )}
        </div>
      </Section>

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out?"
        description="You'll return to the RidePicker welcome screen."
        confirmLabel="Sign out"
        destructive
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Reset development data?"
        description="This restores the development account to its default mock state. Your current changes will be lost."
        confirmLabel="Reset"
        destructive
        onConfirm={() => {
          setConfirmReset(false);
          resetDevData();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

function AssistFilterPreview() {
  const [keywords, setKeywords] = useState([]);
  const [draft, setDraft] = useState("");
  const [sampleMessage, setSampleMessage] = useState("");

  const normalizedMessage = normalize(sampleMessage);
  const matchingKeywords = useMemo(
    () =>
      normalizedMessage
        ? keywords.filter((keyword) => normalizedMessage.includes(normalize(keyword)))
        : [],
    [keywords, normalizedMessage]
  );

  const addKeyword = (event) => {
    event?.preventDefault();
    const value = draft.trim();
    if (!value) return;

    const duplicate = keywords.some((keyword) => normalize(keyword) === normalize(value));
    if (!duplicate) setKeywords((current) => [...current, value]);
    setDraft("");
  };

  const removeKeyword = (keywordToRemove) => {
    setKeywords((current) => current.filter((keyword) => keyword !== keywordToRemove));
  };

  const filterEnabled = keywords.length > 0;
  const sampleWouldPass = !filterEnabled || matchingKeywords.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <div>
          Frontend preview only. Keywords are not saved yet and disappear after refresh.
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Message keywords</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            If this list has keywords, Assist would process a message only when it contains at least one of them.
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            filterEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {filterEnabled ? `${keywords.length} active` : "All messages"}
        </span>
      </div>

      <form onSubmit={addKeyword} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a keyword, e.g. LHR"
          maxLength={80}
          className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add keyword
        </button>
      </form>

      <div className="min-h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-3">
        {keywords.length === 0 ? (
          <div className="text-sm text-slate-500">
            No keywords yet. Assist would currently process all messages.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 text-sm font-medium text-slate-700 shadow-sm"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label={`Remove ${keyword}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <Rule text="Case-insensitive matching" />
        <Rule text="Matches anywhere inside the message" />
        <Rule text="Can match inside a larger word" />
        <Rule text="Any one keyword is enough" />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Try a message</h3>
        </div>
        <textarea
          value={sampleMessage}
          onChange={(event) => setSampleMessage(event.target.value)}
          rows={3}
          placeholder="Paste any example WhatsApp message here..."
          className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
        />

        <div
          className={`mt-3 rounded-lg border px-3.5 py-3 text-sm ${
            !sampleMessage.trim()
              ? "border-slate-200 bg-slate-50 text-slate-500"
              : sampleWouldPass
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {!sampleMessage.trim() ? (
            "Type a message to test the filter."
          ) : sampleWouldPass ? (
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium">This message would pass.</div>
                {filterEnabled ? (
                  <div className="mt-0.5 text-xs opacity-80">
                    Matched: {matchingKeywords.join(", ")}
                  </div>
                ) : (
                  <div className="mt-0.5 text-xs opacity-80">No keyword filter is active.</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium">This message would be ignored by Assist.</div>
              <div className="mt-0.5 text-xs opacity-80">
                None of the configured keywords were found anywhere in the message.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, summary, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.section layout className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {summary && <div className="mt-0.5 truncate text-xs text-slate-400">{summary}</div>}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pb-5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Rule({ text }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
      <span>{text}</span>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
