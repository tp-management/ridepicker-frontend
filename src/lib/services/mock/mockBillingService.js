// Mock billing service.
//
// Subscription belongs to the RidePicker account (not the WhatsApp connection).
// The payment URL comes from config (VITE_PAYMENT_URL) — never hardcoded in
// page components. Replace with a real payment-provider adapter when
// VITE_DATA_MODE=api.
//
// Status values: "none" | "active" | "past_due" | "cancelled".

import { mockDataStore } from "@/lib/mock/mockDataStore";
import { config } from "@/lib/config";

const PLAN = { name: "RidePicker Premium", price: 180, currency: "EUR", interval: "month" };
const MOCK_CARD = { type: "card", brand: "Visa", last4: "4242", expMonth: 12, expYear: 2028 };

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const addMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};
const invId = (d) => `INV-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-001`;
const buildInvoices = () => {
  const now = new Date();
  const list = [];
  for (let i = 3; i >= 1; i--) {
    const d = addMonths(now, -i);
    list.push({ id: invId(d), date: d.toISOString(), amount: PLAN.price, status: "paid" });
  }
  list.push({ id: invId(now), date: now.toISOString(), amount: PLAN.price, status: "paid" });
  return list;
};
const subOf = (user) => mockDataStore.getUser(user?.id)?.subscription || null;

export const mockBillingService = {
  PLAN,

  /** Current subscription for the given RidePicker account, or null. */
  async getSubscription(user) {
    await delay(0);
    return subOf(user);
  },

  /** Configurable external checkout URL (VITE_PAYMENT_URL). */
  getPaymentUrl() {
    return config.paymentUrl;
  },

  /** Subscribe to billing changes. Returns an unsubscribe fn. */
  subscribe(listener) {
    return mockDataStore.subscribe(listener);
  },

  /** Activate a subscription (mock successful payment). */
  async activate(user) {
    await delay(700);
    const now = new Date();
    const rec = {
      status: "active",
      plan: PLAN,
      startedAt: now.toISOString(),
      nextPaymentDate: addMonths(now, 1).toISOString(),
      activeUntil: null,
      paymentMethod: MOCK_CARD,
      invoices: buildInvoices(),
    };
    mockDataStore.setSubscription(user.id, rec);
    return rec;
  },

  /** Simulate a failed payment (dev only). */
  async simulatePaymentFailure(user) {
    await delay(500);
    const cur = subOf(user);
    if (!cur) return null;
    const now = new Date();
    const rec = {
      ...cur,
      status: "past_due",
      nextPaymentDate: now.toISOString(),
      invoices: [{ id: invId(now), date: now.toISOString(), amount: PLAN.price, status: "failed" }, ...(cur.invoices || [])],
    };
    mockDataStore.setSubscription(user.id, rec);
    return rec;
  },

  /** Update the payment method. Clears a past_due state by retrying the charge. */
  async updatePaymentMethod(user) {
    await delay(600);
    const cur = subOf(user);
    if (!cur) return null;
    const now = new Date();
    const rec = {
      ...cur,
      paymentMethod: MOCK_CARD,
      ...(cur.status === "past_due"
        ? {
            status: "active",
            nextPaymentDate: addMonths(now, 1).toISOString(),
            invoices: [{ id: invId(now), date: now.toISOString(), amount: PLAN.price, status: "paid" }, ...(cur.invoices || [])],
          }
        : {}),
    };
    mockDataStore.setSubscription(user.id, rec);
    return rec;
  },

  /** Cancel the subscription. Paid time remains active until activeUntil. */
  async cancel(user) {
    await delay(500);
    const cur = subOf(user);
    if (!cur) return null;
    const rec = { ...cur, status: "cancelled", activeUntil: cur.nextPaymentDate, nextPaymentDate: null };
    mockDataStore.setSubscription(user.id, rec);
    return rec;
  },

  /** Reactivate a cancelled subscription. */
  async reactivate(user) {
    await delay(600);
    const cur = subOf(user);
    if (!cur) return null;
    const now = new Date();
    const rec = {
      ...cur,
      status: "active",
      nextPaymentDate: addMonths(now, 1).toISOString(),
      activeUntil: null,
      invoices: [{ id: invId(now), date: now.toISOString(), amount: PLAN.price, status: "paid" }, ...(cur.invoices || [])],
    };
    mockDataStore.setSubscription(user.id, rec);
    return rec;
  },

  /** Reset billing to the "no subscription" state (dev only). */
  reset(user) {
    mockDataStore.setSubscription(user.id, null);
  },
};