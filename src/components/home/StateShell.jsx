import { cn } from "@/lib/utils";

export default function StateShell({ icon: Icon, iconClass, title, description, action, footer, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="mx-auto max-w-md px-6 py-12 text-center sm:py-16">
        <div className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full", iconClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
        {action && <div className="mt-6 flex flex-col items-center gap-2">{action}</div>}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-8 flex justify-center">{footer}</div>}
      </div>
    </div>
  );
}