import { NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, Activity, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jobs", label: "Jobs", icon: Briefcase, end: false },
  { to: "/activity", label: "Activity", icon: Activity, end: false },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white sm:hidden">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
              isActive ? "text-emerald-600" : "text-slate-400"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}