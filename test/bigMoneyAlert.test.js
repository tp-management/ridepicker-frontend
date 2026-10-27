import test from "node:test";
import assert from "node:assert/strict";
import {
  BIG_MONEY_ALERT_EVENT,
  BIG_MONEY_DECISION_EVENT,
  bigMoneyDecision,
  readBigMoneyAlert,
} from "../src/lib/bigMoneyAlert.js";

test("BIG MONEY alert preserves the entire original WhatsApp text exactly", () => {
  const originalMessage =
    "🚕 Driver needed!\n  Heathrow → London\n£350\n\nCall me ASAP  +44 7000 000000\n";
  const alert = readBigMoneyAlert({ messageId: 42, originalMessage });
  assert.deepEqual(alert, { messageId: "42", originalMessage });
  assert.equal(alert.originalMessage.endsWith("\n"), true);
  assert.equal(alert.originalMessage.includes("  Heathrow"), true);
});

test("rejects missing/blank message bodies and does not synthesize content", () => {
  assert.equal(readBigMoneyAlert(null), null);
  assert.equal(readBigMoneyAlert({ body: "summary only" }), null);
  assert.equal(readBigMoneyAlert({ originalMessage: "   " }), null);
  assert.equal(readBigMoneyAlert({ originalMessage: ["line one"] }), null);
  assert.deepEqual(readBigMoneyAlert({ originalMessage: "WhatsApp raw" }), {
    messageId: null,
    originalMessage: "WhatsApp raw",
  });
});

test("ACCEPT and DECLINE produce only local decisions, without invented job fields", () => {
  const alert = readBigMoneyAlert({ messageId: "message-7", originalMessage: "full body" });
  assert.deepEqual(bigMoneyDecision(alert, "accept"), {
    messageId: "message-7",
    decision: "accept",
  });
  assert.deepEqual(bigMoneyDecision(alert, "decline"), {
    messageId: "message-7",
    decision: "decline",
  });
  assert.equal(bigMoneyDecision(alert, "automatic_booking"), null);
  assert.equal(BIG_MONEY_ALERT_EVENT, "ridepicker:big-money-job");
  assert.equal(BIG_MONEY_DECISION_EVENT, "ridepicker:big-money-decision");
});
