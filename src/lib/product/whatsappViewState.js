// A missing session is not evidence of disconnection until the initial check
// has completed successfully. Keep transport errors distinct from user intent.
export function resolveWhatsAppStatus({ session = null, loading = false, unavailable = false } = {}) {
  if (loading) return "loading";
  if (unavailable) return "unknown";
  if (session?.status === "connected") return "connected";
  if (session?.status === "reconnecting") return "reconnecting";
  return "disconnected";
}

export function shouldShowWhatsAppOnboarding({ status, hasJobs, demoMode } = {}) {
  return status === "disconnected" && !hasJobs && !demoMode;
}
