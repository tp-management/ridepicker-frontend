import test from "node:test";
import assert from "node:assert/strict";
import { resolveWhatsAppStatus, shouldShowWhatsAppOnboarding } from "../src/lib/product/whatsappViewState.js";

test("unresolved session never means disconnected", () => {
  assert.equal(resolveWhatsAppStatus({ loading: true }), "loading");
  assert.equal(resolveWhatsAppStatus({ session: { status: "connected" }, loading: true }), "loading");
  assert.equal(shouldShowWhatsAppOnboarding({ status: "loading", hasJobs: false, demoMode: false }), false);
});

test("initial network failures never show connection onboarding", () => {
  assert.equal(resolveWhatsAppStatus({ unavailable: true }), "unknown");
  assert.equal(shouldShowWhatsAppOnboarding({ status: "unknown", hasJobs: false, demoMode: false }), false);
});

test("only confirmed disconnection with no jobs shows onboarding", () => {
  assert.equal(resolveWhatsAppStatus(), "disconnected");
  assert.equal(shouldShowWhatsAppOnboarding({ status: "disconnected", hasJobs: false, demoMode: false }), true);
  assert.equal(shouldShowWhatsAppOnboarding({ status: "disconnected", hasJobs: true, demoMode: false }), false);
  assert.equal(shouldShowWhatsAppOnboarding({ status: "disconnected", hasJobs: false, demoMode: true }), false);
});

test("connected and reconnecting sessions retain their true states", () => {
  assert.equal(resolveWhatsAppStatus({ session: { status: "connected" } }), "connected");
  assert.equal(resolveWhatsAppStatus({ session: { status: "reconnecting" } }), "reconnecting");
  assert.equal(resolveWhatsAppStatus({ session: { status: "logged_out" } }), "disconnected");
});
