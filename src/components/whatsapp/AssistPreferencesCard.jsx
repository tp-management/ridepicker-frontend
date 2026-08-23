import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ListFilter,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  WifiOff,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { assistPreferencesService } from "@/lib/services/assistPreferencesService";

const MAX_KEYWORDS = 50;
const MAX_KEYWORD_LENGTH = 80;
const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF]/g;

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(ZERO_WIDTH_PATTERN, "")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

function cleanKeyword(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(ZERO_WIDTH_PATTERN, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function sameKeywords(a, b) {
  if (a.length !== b.length) return false;
  return a.every((keyword, index) => keyword === b[index]);
}

export default function AssistPreferencesCard({ enabled, userId }) {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState([]);
  const [savedKeywords, setSavedKeywords] = useState([]);
  const [draft, setDraft] = useState("");
  const [sampleMessage, setSampleMessage] = useState("");
  const [showTester, setShowTester] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [inputError, setInputError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      setKeywords([]);
      setSavedKeywords([]);
      setLoading(false);
      setLoadError(null);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setLoadError(null);

    assistPreferencesService
      .get(userId)
      .then((preferences) => {
        if (!active) return;
        const next = Array.isArray(preferences?.keywords) ? preferences.keywords : [];
        setKeywords(next);
        setSavedKeywords(next);
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

  const normalizedMessage = normalize(sampleMessage);
  const matchingKeywords = useMemo(
    () =>
      normalizedMessage
        ? keywords.filter((keyword) => normalizedMessage.includes(normalize(keyword)))
        : [],
    [keywords, normalizedMessage]
  );

  const filterEnabled = keywords.length > 0;
  const sampleWouldPass = !filterEnabled || matchingKeywords.length > 0;
  const dirty = !sameKeywords(keywords, savedKeywords);
  const controlsDisabled = !enabled || loading || Boolean(loadError);

  const addKeywords = (raw) => {
    if (!enabled || loading || loadError) return;

    const incoming = String(raw || "")
      .split(/[,\n]+/)
      .map(cleanKeyword)
      .filter(Boolean);

    if (!incoming.length) return;

    const next = [...keywords];
    const seen = new Set(next.map(normalize));

    for (const keyword of incoming) {
      if (keyword.length > MAX_KEYWORD_LENGTH) {
        setInputError(`Keep each keyword under ${MAX_KEYWORD_LENGTH} characters.`);
        return;
      }

      const normalized = normalize(keyword);
      if (seen.has(normalized)) continue;

      if (next.length >= MAX_KEYWORDS) {
        setInputError(`You can add up to ${MAX_KEYWORDS} keywords.`);
        return;
      }

      seen.add(normalized);
      next.push(keyword);
    }

    setKeywords(next);
    setDraft("");
    setInputError("");
  };

  const addDraft = (event) => {
    event?.preventDefault();
    addKeywords(draft);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeywords(draft);
    }
  };

  const handlePaste = (event) => {
    const text = event.clipboardData?.getData("text") || "";
    if (!/[,\n]/.test(text)) return;
    event.preventDefault();
    addKeywords(text);
  };

  const removeKeyword = (keywordToRemove) => {
    if (controlsDisabled || saving) return;
    setKeywords((current) => current.filter((keyword) => keyword !== keywordToRemove));
    setInputError("");
  };

  const saveKeywords = async () => {
    if (!enabled || !userId || !dirty || saving || loadError) return;

    setSaving(true);
    try {
      const preferences = await assistPreferencesService.update(userId, keywords);
      const next = Array.isArray(preferences?.keywords) ? preferences.keywords : [];
      setKeywords(next);
      setSavedKeywords(next);
      toast({
        title: "Assist preferences saved",
        description: next.length
          ? `${next.length} keyword${next.length === 1 ? "" : "s"} will filter incoming WhatsApp messages.`
          : "No keyword filter is active. Assist will process all incoming messages.",
      });
    } catch (error) {
      toast({
        title: "Could not save Assist preferences",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    if (saving) return;
    setKeywords(savedKeywords);
    setDraft("");
    setInputError("");
  };

  return (
    <section
      aria-disabled={!enabled}
      className={`rounded-xl border p-4 transition-colors sm:p-5 ${
        enabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-100/70"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              enabled ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
            }`}
          >
            <ListFilter className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className={`text-sm font-semibold ${enabled ? "text-slate-900" : "text-slate-500"}`}>
              Assist preferences
            </h2>
            <p className={`mt-1 text-sm leading-5 ${enabled ? "text-slate-500" : "text-slate-400"}`}>
              Only let matching incoming WhatsApp messages reach Assist.
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-500"
          }`}
        >
          {enabled ? "Connected" : "Connect WhatsApp"}
        </span>
      </div>

      {!enabled && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white/70 px-3.5 py-3 text-sm text-slate-500">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <div>Connect WhatsApp first to change message filters.</div>
        </div>
      )}

      {loadError && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{loadError?.message || "Could not load saved Assist preferences."}</span>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading saved preferences…
        </div>
      ) : (
        <fieldset disabled={controlsDisabled} className={!enabled ? "select-none opacity-50" : ""}>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Message keywords</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  A message passes when it contains any saved keyword, anywhere in its text.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
                {keywords.length} / {MAX_KEYWORDS}
              </span>
            </div>

            <form onSubmit={addDraft} className="mt-3">
              <div className="flex items-stretch gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setInputError("");
                  }}
                  onKeyDown={handleInputKeyDown}
                  onPaste={handlePaste}
                  placeholder="e.g. LHR or airport transfer"
                  maxLength={MAX_KEYWORD_LENGTH}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/70 disabled:cursor-not-allowed sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || keywords.length >= MAX_KEYWORDS}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-4"
                  aria-label="Add keyword"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add keyword</span>
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-400">
                <span>Press Enter or comma. Paste a comma-separated list to add several.</span>
                <span>Max {MAX_KEYWORD_LENGTH} characters each</span>
              </div>
              {inputError && <p className="mt-2 text-xs font-medium text-rose-600">{inputError}</p>}
            </form>

            {keywords.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-3 text-sm text-slate-500">
                No filter active. Assist will process all incoming messages.
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Saved Assist keywords">
                {keywords.map((keyword) => (
                  <span
                    key={`${normalize(keyword)}:${keyword}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    <span className="min-w-0 break-words">{keyword}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                      aria-label={`Remove ${keyword}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                Matching ignores letter case, normalizes odd whitespace, and can match inside a larger word.
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {dirty ? (
                <span className="font-medium text-amber-600">Unsaved changes</span>
              ) : filterEnabled ? (
                `${savedKeywords.length} keyword${savedKeywords.length === 1 ? "" : "s"} saved`
              ) : (
                "All incoming messages are currently allowed"
              )}
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              {dirty && (
                <button
                  type="button"
                  onClick={resetChanges}
                  disabled={saving}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={saveKeywords}
                disabled={!dirty || saving}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setShowTester((value) => !value)}
              className="flex w-full items-center gap-2 px-3.5 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              aria-expanded={showTester}
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="flex-1">Test a message against this filter</span>
              <motion.span animate={{ rotate: showTester ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {showTester && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-100 p-3.5">
                    <textarea
                      value={sampleMessage}
                      onChange={(event) => setSampleMessage(event.target.value)}
                      rows={3}
                      placeholder="Paste any example WhatsApp message here…"
                      className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/60 disabled:cursor-not-allowed sm:text-sm"
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
                            <div className="font-medium">This message passes.</div>
                            <div className="mt-0.5 text-xs opacity-80">
                              {filterEnabled
                                ? `Matched: ${matchingKeywords.join(", ")}`
                                : "No keyword filter is active."}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">This message will be ignored by Assist.</div>
                          <div className="mt-0.5 text-xs opacity-80">
                            None of the configured keywords appear anywhere in the message.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </fieldset>
      )}
    </section>
  );
}
