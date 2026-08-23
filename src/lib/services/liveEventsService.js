import { isApiMode } from "@/lib/config";
import { liveEventsApi } from "./api/liveEventsApi";

export const liveEventsService = {
  connect(userId) {
    if (!isApiMode()) return () => {};
    return liveEventsApi.connect(userId);
  },
};
