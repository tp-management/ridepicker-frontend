import { Eye, X } from "lucide-react";

export default function DemoBanner({ visible, onExit }) {
  if (!visible) return null;
  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <Eye className="h-4 w-4 text-amber-600" />
        <span className="font-medium text-amber-900">Demo data</span>
        <span className="text-amber-700">— this is sample content, not your real jobs.</span>
      </div>
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:underline"
      >
        <X className="h-3.5 w-3.5" /> Exit demo
      </button>
    </div>
  );
}