import { useEffect } from "react";

import { isApiMode } from "@/lib/config";
import { apiChanges } from "@/lib/services/api/apiClient";

const VISIBLE_REFRESH_MS = 3000;
const HIDDEN_REFRESH_MS = 15000;

export default function LiveDataHeartbeat() {
  useEffect(() => {
    if (!isApiMode()) return undefined;

    let timer = null;
    let stopped = false;

    const pulse = () => {
      if (stopped) return;
      apiChanges.notify();
    };

    const schedule = () => {
      if (stopped) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        pulse();
        schedule();
      }, document.hidden ? HIDDEN_REFRESH_MS : VISIBLE_REFRESH_MS);
    };

    const refreshNow = () => {
      pulse();
      schedule();
    };

    const onVisibility = () => {
      if (!document.hidden) pulse();
      schedule();
    };

    window.addEventListener("focus", refreshNow);
    window.addEventListener("online", refreshNow);
    document.addEventListener("visibilitychange", onVisibility);

    pulse();
    schedule();

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("focus", refreshNow);
      window.removeEventListener("online", refreshNow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
