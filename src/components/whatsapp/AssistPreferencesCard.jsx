import { useMemo, useState } from "react";
import { Check, Info, ListFilter, Plus, Search, WifiOff, X } from "lucide-react";

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

export default function AssistPreferencesCard({ enabled }) {
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
    if (!enabled) return;
    const value = draft.trim();
    if (!value) return;

    const duplicate = keywords.some((keyword) => normalize(keyword) === normalize(value));
    if (!duplicate) setKeywords((current) => [...current, value]);
    setDraft("");
  };

  const removeKeyword = (keywordToRemove) => {
    if (!enabled) return;
    setKeywords((current) => current.filter((keyword) => keyword !== keywordToRemove));
  };

  const filterEnabled = keywords.length > 0;
  const sampleWouldPass = !filterEnabled || matchingKeywords.length > 0;

  return (
    <section
      aria-disabled={!enabled}
      className={`rounded-xl border p-5 transition-colors ${
        enabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-100/70"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              enabled ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
            }`}
          >
            <ListFilter className="h-4 w-4" />
          </div>
          <div>
            <h2 className={`text-sm font-semibold ${enabled ? "text-slate-900" : "text-slate-500"}`}>
              Assist preferences
            </h2>
            <p className={`mt-1 text-sm ${enabled ? "text-slate-500" : "text-slate-400"}`}>
              Choose which WhatsApp messages Assist should pay attention to.
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-500"
          }`}
        >
          {enabled ? "Available" : "Connect WhatsApp"}
        </span>
      </div>

      {!enabled && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white/70 px-3.5 py-3 text-sm text-slate-500">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <div>Connect WhatsApp first to configure Assist message filtering.</div>
        </div>
      )}

      <fieldset disabled={!enabled} className={!enabled ? "select-none opacity-45" : ""}>
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm text-sky-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <div>Frontend preview only. Keywords are not saved yet and disappear after refresh.</div>
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
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

        <form onSubmit={addKeyword} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a keyword, e.g. LHR"
            maxLength={80}
            className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/60 disabled:cursor-not-allowed"
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

        <div className="mt-3 min-h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-3">
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
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                    aria-label={`Remove ${keyword}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <Rule text="Case-insensitive matching" />
          <Rule text="Matches anywhere inside the message" />
          <Rule text="Can match inside a larger word" />
          <Rule text="Any one keyword is enough" />
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Try a message</h3>
          </div>
          <textarea
            value={sampleMessage}
            onChange={(event) => setSampleMessage(event.target.value)}
            rows={3}
            placeholder="Paste any example WhatsApp message here..."
            className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/60 disabled:cursor-not-allowed"
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
      </fieldset>
    </section>
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
