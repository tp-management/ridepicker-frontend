import test from "node:test";
import assert from "node:assert/strict";
import {
  BIG_MONEY_ALERT_EVENT,
  BIG_MONEY_DECISION_EVENT,
  bigMoneyDecision,
  readBigMoneyAlert,
  reconcileBigMoneyQueue,
  withoutBigMoneyAlert,
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


test("pending inbox combines raw DB messages, keeps previews and deduplicates IDs", () => {
  const preview = { messageId: "preview-1", originalMessage: "Preview" };
  const rows = [
    { id: "12", source: "DB", messageId: "77", originalMessage: "Hello\nWorld" },
    { id: "12", source: "DB", messageId: "77", originalMessage: "Hello\nWorld" },
    { id: "13", messageId: "78", originalMessage: "  🛫 Long trip\n£950 " },
  ];
  const result = reconcileBigMoneyQueue([preview], rows);
  assert.deepEqual(result.map((entry) => entry.id ?? "preview"), ["preview", "12", "13"]);
  assert.equal(result[2].originalMessage, "  🛫 Long trip\n£950 ");
  assert.deepEqual(reconcileBigMoneyQueue(result, rows, new Set(["12"])).map((entry) =>
    entry.id ?? "preview"), ["preview", "13"]);
  assert.deepEqual(reconcileBigMoneyQueue([], [{ id: 5, originalMessage: " " }]), []);
});

test("acknowledged alert is removed without hiding other queued messages", () => {
  const initial = [
    { id: "1", originalMessage: "First" },
    { id: "2", originalMessage: "Second" },
  ];
  assert.deepEqual(withoutBigMoneyAlert(initial, initial[0]), [initial[1]]);
  const preview = { messageId: "preview", originalMessage: "Test" };
  assert.deepEqual(withoutBigMoneyAlert([preview, initial[1]], preview), [initial[1]]);
  assert.deepEqual(withoutBigMoneyAlert(initial, null), initial);
});
