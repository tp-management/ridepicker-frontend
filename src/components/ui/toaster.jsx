import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import ToastProgress from "@/components/ui/toast-progress";

// Per-type countdown durations (ms). `persistent` toasts never auto-dismiss.
const DURATION_BY_TYPE = {
  success: 2000,
  info: 2000,
  warning: 4000,
  error: 6000,
};

const durationFor = (toast) => {
  if (toast.persistent) return null;
  if (typeof toast.duration === "number") return toast.duration;
  if (toast.type && DURATION_BY_TYPE[toast.type]) return DURATION_BY_TYPE[toast.type];
  if (toast.variant === "destructive") return DURATION_BY_TYPE.error;
  return DURATION_BY_TYPE.info;
};

// Disable Radix's own auto-dismiss timer; ToastProgress owns the timing so the
// bar stays in sync with hover-pause.
const RADIX_DURATION = 2147483647;

function ToastItem({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const { title, description, action, type, persistent, duration, ...rest } = toast;
  const ms = durationFor(toast);

  return (
    <Toast
      {...rest}
      duration={RADIX_DURATION}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      {action}
      <ToastClose />
      {ms != null && (
        <ToastProgress durationMs={ms} paused={paused} onExpire={() => onDismiss(toast.id)} />
      )}
    </Toast>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}