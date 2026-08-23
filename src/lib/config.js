// Centralized runtime configuration for RidePicker.

const env = (import.meta && import.meta.env) || {};
const truthy = (v) => String(v) === "true";

// Production is ALWAYS live API mode.
// Mock mode is allowed only during local development and only when explicitly
// requested with VITE_DATA_MODE=mock.
const dataMode =
  env.DEV && env.VITE_DATA_MODE === "mock"
    ? "mock"
    : "api";

export const config = {
  dataMode,

  ridePickerApiUrl:
    env.VITE_RIDEPICKER_API_URL ||
    "https://ridepicker-whatsapp-production.up.railway.app",

  // Supabase project URL and publishable key are browser-safe identifiers, not
  // service-role secrets. Environment values can override these defaults.
  supabaseUrl:
    env.VITE_SUPABASE_URL ||
    "https://gozmjyksnzjhehhnnvon.supabase.co",
  supabasePublishableKey:
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_E9ddwctWohghQGitu_lasQ_-USmeDoE",

  paymentUrl: env.VITE_PAYMENT_URL || "",

  // Development controls can never appear in a production build.
  enableDevTools:
    Boolean(env.DEV) &&
    truthy(env.VITE_ENABLE_DEV_TOOLS),
};

export const isMockMode = () => config.dataMode === "mock";
export const isApiMode = () => config.dataMode === "api";
