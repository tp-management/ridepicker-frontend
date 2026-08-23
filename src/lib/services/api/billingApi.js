import { config } from "@/lib/config";
import { apiChanges, apiRequest, encoded } from "./apiClient";

const PLAN = { name: "RidePicker Premium", price: 180, currency: "EUR", interval: "month" };

function normalizeSubscription(subscription) {
  if (!subscription) return null;
  return {
    ...subscription,
    status: subscription.status === "payment_required" ? "none" : subscription.status,
  };
}

async function fetchSubscription(userId) {
  const data = await apiRequest(`/api/users/${encoded(userId)}/billing`);
  return normalizeSubscription(data?.subscription || null);
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
    return apiChanges.subscribe(listener, "billing");
  },

  async activate(user) {
    const data = await apiRequest(`/api/users/${encoded(user.id)}/billing/activate`, {
      method: "POST",
    });
    return normalizeSubscription(data?.subscription || null);
  },

  async simulatePaymentFailure(user) {
    return fetchSubscription(user?.id);
  },

  async updatePaymentMethod(user) {
    return fetchSubscription(user?.id);
  },

  async cancel(user) {
    const data = await apiRequest(`/api/users/${encoded(user.id)}/billing/cancel`, {
      method: "POST",
    });
    return normalizeSubscription(data?.subscription || null);
  },

  async reactivate(user) {
    const data = await apiRequest(`/api/users/${encoded(user.id)}/billing/reactivate`, {
      method: "POST",
    });
    return normalizeSubscription(data?.subscription || null);
  },

  reset() {},
};
