import { apiChanges, apiRequest } from "./apiClient";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  requestPhoneOtp,
  signOutPhoneAuth,
  verifyPhoneOtp,
} from "./supabasePhoneAuth";

const LEGACY_SESSION_KEY = "ridepicker_api_session_v1";

function ridePickerSession(user) {
  return {
    user,
    provider: "supabase_phone_otp",
    createdAt: user?.createdAt || new Date().toISOString(),
  };
}

function clearLegacySession() {
  try {
    localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // ignore storage failures
  }
}

async function bootstrap(name = null) {
  const data = await apiRequest("/api/auth/bootstrap", {
    method: "POST",
    body: name ? { name } : {},
  });
  return data?.user || null;
}

function resultError(error, fallback) {
  return {
    status: "error",
    message: error?.message || fallback,
    code: error?.details?.code || error?.code || null,
  };
}

export const authApi = {
  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async getSession() {
    clearLegacySession();
    if (!getStoredAuthSession()) return null;

    try {
      const user = await bootstrap();
      if (!user) return null;
      return ridePickerSession(user);
    } catch (error) {
      if (error?.status === 401) {
        clearStoredAuthSession();
        return null;
      }
      if (error?.details?.code === "profile_required") {
        return null;
      }
      throw error;
    }
  },

  clearSession() {
    clearLegacySession();
    clearStoredAuthSession();
    apiChanges.notify();
  },

  logout() {
    clearLegacySession();
    void signOutPhoneAuth();
    apiChanges.notify();
  },

  async requestOtp(phone) {
    try {
      const normalizedPhone = await requestPhoneOtp(phone);
      return { status: "otp_sent", phone: normalizedPhone };
    } catch (error) {
      return resultError(error, "Could not send the verification code.");
    }
  },

  async verifyOtp({ phone, code }) {
    try {
      await verifyPhoneOtp(phone, code);

      try {
        const user = await bootstrap();
        if (!user) {
          return { status: "error", message: "RidePicker did not return your account." };
        }
        apiChanges.notify();
        return { status: "authenticated", user };
      } catch (error) {
        if (error?.details?.code === "profile_required") {
          return { status: "profile_required" };
        }
        throw error;
      }
    } catch (error) {
      return resultError(error, "The verification code could not be confirmed.");
    }
  },

  async completeProfile({ name }) {
    try {
      const user = await bootstrap(name);
      if (!user) {
        return { status: "error", message: "RidePicker did not return the new account." };
      }
      apiChanges.notify();
      return { status: "authenticated", user };
    } catch (error) {
      return resultError(error, "Could not create your RidePicker account.");
    }
  },

  // Compatibility aliases retained for callers outside the current auth form.
  async openExistingAccount(phone) {
    return this.requestOtp(phone);
  },

  async signUp({ name }) {
    if (!getStoredAuthSession()) {
      return {
        status: "error",
        message: "Verify your phone number before creating an account.",
      };
    }
    return this.completeProfile({ name });
  },

  async lookupByPhone() {
    return null;
  },

  isDevUser() {
    return false;
  },

  resetDevAccount() {
    return null;
  },
};
