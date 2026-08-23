import { useEffect, useRef } from "react";

import { useAuth } from "@/lib/AuthContext";
import { isApiMode } from "@/lib/config";
import { apiChanges } from "@/lib/services/api/apiClient";
import { profileService } from "@/lib/services/profileService";

const VISIBLE_REFRESH_MS = 3000;
const HIDDEN_REFRESH_MS = 15000;

export default function LiveDataHeartbeat() {
  const { user, applyPhoneSession } = useAuth();
  const userRef = useRef(user);
  const applyRef = useRef(applyPhoneSession);

  useEffect(() => {
    userRef.current = user;
    applyRef.current = applyPhoneSession;
  }, [user, applyPhoneSession]);

  useEffect(() => {
    if (!isApiMode()) return undefined;
    let timer;
    let stopped = false;

    const pulse = () => {
      if (!stopped) apiChanges.notify();
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

  useEffect(() => {
    const userId = user?.id;
    if (!isApiMode() || !userId) return undefined;
    let active = true;

    const syncProfile = async () => {
      try {
        const profile = await profileService.get(userId);
        const current = userRef.current;
        if (!active || !profile || !current || current.id !== userId) return;

        const name = profile.name ?? current.full_name ?? current.name ?? "";
        const phone = profile.phone ?? current.phone ?? "";
        const email = profile.email ?? current.email ?? "";
        if (
          name === (current.full_name || current.name || "") &&
          phone === (current.phone || "") &&
          email === (current.email || "")
        ) return;

        applyRef.current({
          ...current,
          full_name: name,
          name,
          phone,
          email,
          profile: { ...(current.profile || {}), name, phone, email },
        });
      } catch {
        // Keep the last known profile on transient failures.
      }
    };

    const unsubscribe = profileService.subscribe(syncProfile);
    syncProfile();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.id]);

  return null;
}
