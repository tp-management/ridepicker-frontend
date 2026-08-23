// Controlled "adapter not configured" stub.
//
// Every service facade selects its implementation via VITE_DATA_MODE (see
// config.js). When VITE_DATA_MODE=api but the matching API adapter in
// src/lib/services/api/* does not exist yet, the facade returns a stub built
// by this helper instead of falling back to mock data. Calling any data method
// fails with a clear error, so a real user is NEVER shown fake data.
//
// `extras` lets a facade provide the few non-data members that are not fake
// data and that the app needs only to wire up (e.g. billingService.PLAN
// metadata, billingService.getPaymentUrl() from config, authService.isDevUser()
// = false). `subscribe` always returns a no-op unsubscribe so context providers
// can attach listeners without crashing.

const message = (name) =>
  `RidePicker ${name} adapter not configured. Implement src/lib/services/api/${name}Api.js ` +
  `and set VITE_DATA_MODE=api with the required env vars, or keep VITE_DATA_MODE=mock.`;

export function notConfigured(name, extras = {}) {
  const reject = async () => {
    throw new Error(message(name));
  };
  const noopUnsubscribe = () => () => {};
  return new Proxy({ ...extras }, {
    get(target, prop) {
      if (typeof prop === "symbol") return undefined;
      if (prop in target) return target[prop];
      if (prop === "subscribe") return noopUnsubscribe;
      // Don't let JS internals mistake the stub for a thenable/iterable.
      if (prop === "then" || prop === "catch" || prop === "finally") return undefined;
      return reject;
    },
  });
}