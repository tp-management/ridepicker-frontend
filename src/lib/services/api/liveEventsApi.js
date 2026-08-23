import { apiChanges, apiUrl, encoded } from "./apiClient";

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

    return () => source.close();
  },
};
