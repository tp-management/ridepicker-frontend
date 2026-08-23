import { config } from "@/lib/config";
import { assistPreferencesApi } from "./api/assistPreferencesApi";
import { mockAssistPreferencesService } from "./mock/mockAssistPreferencesService";

export const assistPreferencesService =
  config.dataMode === "api" ? assistPreferencesApi : mockAssistPreferencesService;
