import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CollapsiblePreferenceSection({
  icon: Icon,
  title,
  summary,
  enabled = true,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.section
      layout
      aria-disabled={!enabled}
      className={`overflow-hidden rounded-xl border transition-colors ${
        enabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-100/70"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50/70 sm:px-5"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            enabled ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className={`text-sm font-semibold ${enabled ? "text-slate-900" : "text-slate-500"}`}>
            {title}
          </h2>
          {summary && (
            <p className={`mt-0.5 truncate text-xs ${enabled ? "text-slate-400" : "text-slate-400"}`}>
              {summary}
            </p>
          )}
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
            <div className="border-t border-slate-100 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 [&>section]:rounded-none [&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section>div:first-child]:hidden">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
