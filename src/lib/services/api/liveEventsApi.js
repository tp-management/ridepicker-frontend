import { apiChanges, apiUrl, encoded } from "./apiClient";
import { BIG_MONEY_ALERT_EVENT } from "@/lib/bigMoneyAlert";

export const liveEventsApi = {
  connect(userId) {
    if (!userId || typeof window === "undefined" || typeof EventSource === "undefined") {
      return () => {};
    }

    const source = new EventSource(
      apiUrl(`/api/users/${encoded(userId)}/events`)
    );
    let openedOnce = false;

    source.onopen = () => {
      if (openedOnce) {
        // The server intentionally keeps no replay buffer. After a network gap,
        // refresh once so changes that happened while disconnected cannot be
        // missed. This is reconnect recovery, not polling.
        apiChanges.notify({
          scopes: ["all"],
          reason: "live_stream_reconnected",
        });
      }
      openedOnce = true;
    };

    source.addEventListener("change", (event) => {
      try {
        const payload = JSON.parse(event.data || "{}");
        apiChanges.notify(payload);
      } catch {
        apiChanges.notify({ scopes: ["all"], reason: "invalid_live_event" });
      }
    });

    // Reserved for explicit server-side BIG MONEY detection. The existing
    // backend does not emit this event until a detector is connected.
    source.addEventListener("big_money_job", (event) => {
      try {
        const detail = JSON.parse(event.data || "{}");
        window.dispatchEvent(new CustomEvent(BIG_MONEY_ALERT_EVENT, { detail }));
      } catch {
        console.warn("Ignoring malformed BIG MONEY alert payload");
      }
    });

    return () => source.close();
  },
};
