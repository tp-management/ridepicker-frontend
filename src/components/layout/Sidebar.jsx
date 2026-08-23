import { NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, Activity, MessageCircle, ListFilter, Settings, LogOut } from "lucide-react";
import { GlobalStatus } from "./GlobalStatus";
import { useAuth } from "@/lib/AuthContext";
import { useProduct } from "@/lib/product/ProductContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jobs", label: "Jobs", icon: Briefcase, end: false },
  { to: "/activity", label: "Activity", icon: Activity, end: false },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle, end: false },
  { to: "/assist-preferences", label: "Assist preferences", icon: ListFilter, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

function initials(name, email) {
  if (name) return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (email) return email[0].toUpperCase();
  return "·";
}

export default function Sidebar() {
  const { user } = useAuth();
  const { logout } = useProduct();
  const name = user?.full_name || user?.email || "Account";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white sm:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <span className="text-sm font-bold">R</span>
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900">RidePicker</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 p-3">
        <GlobalStatus />
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {initials(user?.full_name, user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-900">{name}</div>
            {user?.email && <div className="truncate text-xs text-slate-400">{user.email}</div>}
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}