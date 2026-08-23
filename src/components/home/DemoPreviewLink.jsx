import { config } from "@/lib/config";

// "Preview RidePicker with demo data" — a development-only control.
// Hidden unless VITE_ENABLE_DEV_TOOLS=true.
export default function DemoPreviewLink({ onClick }) {
  if (!config.enableDevTools) return null;
  return (
    <button
      onClick={onClick}
      className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-700"
    >
      Preview RidePicker with demo data
    </button>
  );
}