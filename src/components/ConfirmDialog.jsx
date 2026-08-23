import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-colors",
                  destructive ? "bg-rose-600 hover:bg-rose-500" : "bg-slate-900 hover:bg-slate-800"
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}