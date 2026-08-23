import { config } from "@/lib/config";
import { apiChanges, apiRequest, encoded } from "./apiClient";

const PLAN = { name: "RidePicker Premium", price: 180, currency: "EUR", interval: "month" };

function normalizeSubscription(subscription) {
  if (!subscription) return null;
  return {
    ...subscription,
    // The current UI calls the not-yet-paid state "none".
    status: subscription.status === "payment_required" ? "none" : subscription.status,
  };
}

async function fetchSubscription(userId) {
  const data = await apiRequest(`/api/users/${encoded(userId)}/billing`);
  return normalizeSubscription(data?.subscription || null);
}

function providerManagedBilling() {
  const error = new Error("Billing changes must be completed through the payment provider.");
  error.status = 403;
  throw error;
}

export const billingApi = {
  PLAN,

  async getSubscription(user) {
    if (!user?.id) return null;
    return fetchSubscription(user.id);
  },

  async listInvoices(user) {
    if (!user?.id) return [];
    const data = await apiRequest(`/api/users/${encoded(user.id)}/billing/invoices`);
    return data?.invoices || [];
  },

  getPaymentUrl() {
    return config.paymentUrl;
  },

  subscribe(listener) {
    return apiChanges.subscribe(listener);
  },

  async activate() {
    return providerManagedBilling();
  },

  async simulatePaymentFailure(user) {
    return fetchSubscription(user?.id);
  },

  async updatePaymentMethod(user) {
    return fetchSubscription(user?.id);
  },

  async cancel() {
    return providerManagedBilling();
  },

  async reactivate() {
    return providerManagedBilling();
  },

  reset() {
    // There is deliberately no production "reset billing" endpoint.
  },
};
