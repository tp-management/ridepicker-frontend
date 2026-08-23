// Public billingService facade.
//
// Selects the implementation from VITE_DATA_MODE (see config.js):
//   mock -> mockBillingService (localStorage)
//   api  -> billingApi (RidePicker backend subscription API)
//
// Interface (async unless noted):
//   PLAN                                          (static metadata, not fake data)
//   getSubscription(user) -> Promise<subscription | null>
//   getPaymentUrl() -> string                     (from VITE_PAYMENT_URL via config)
//   subscribe(listener) -> unsub
//   activate(user) -> Promise<subscription>
//   simulatePaymentFailure(user) -> Promise<subscription>   (dev only)
//   updatePaymentMethod(user) -> Promise<subscription>
//   cancel(user) -> Promise<subscription>
//   reactivate(user) -> Promise<subscription>
//   reset(user)                                  (dev only)
//
// The checkout URL stays configurable via VITE_PAYMENT_URL. API mode reads and
// updates the current backend subscription state.

import { config } from "@/lib/config";
import { mockBillingService } from "./mock/mockBillingService";
import { billingApi } from "./api/billingApi";


export const billingService =
  config.dataMode === "api"
    ? billingApi
    : mockBillingService;
