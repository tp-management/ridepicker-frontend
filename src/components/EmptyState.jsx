export default function EmptyState({ title, description, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="text-sm font-medium text-slate-900">{title}</div>
      {description && (
        <div className="mt-1 max-w-sm text-sm text-slate-500">{description}</div>
      )}
      {action}
    </div>
  );
}