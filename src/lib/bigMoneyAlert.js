// The trigger must supply the raw WhatsApp message, not an AI summary or parsed fields.
export const BIG_MONEY_ALERT_EVENT = "ridepicker:big-money-job";
export const BIG_MONEY_DECISION_EVENT = "ridepicker:big-money-decision";

export function readBigMoneyAlert(detail) {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return null;
  }

  if (
    typeof detail.originalMessage !== "string" ||
    !detail.originalMessage.trim()
  ) {
    return null;
  }

  return {
    messageId:
      detail.messageId === undefined || detail.messageId === null
        ? null
        : String(detail.messageId),
    // Never trim, truncate, convert line breaks, or parse the original body.
    originalMessage: detail.originalMessage,
  };
}

export function bigMoneyDecision(alert, decision) {
  if (!alert || !["accept", "decline"].includes(decision)) return null;
  return { messageId: alert.messageId, decision };
}


// The DB is authoritative for persistent alerts. Local preview / future
// transient events may coexist, but a handled row must never reappear because
// an older GET request completed after an ACCEPT / DECLINE.
export function reconcileBigMoneyQueue(current, pendingRows, handledIds = new Set()) {
  const localAlerts = (Array.isArray(current) ? current : [])
    .filter((entry) => entry && (entry.id === undefined || entry.id === null));
  const persisted = (Array.isArray(pendingRows) ? pendingRows : [])
    .map((row) => {
      const raw = readBigMoneyAlert(row);
      if (!raw || row.id === undefined || row.id === null) return null;
      return { ...row, ...raw };
    })
    .filter((row) => row && !handledIds.has(String(row.id)));
  const seen = new Set();
  return [...localAlerts, ...persisted].filter((row, index) => {
    const key = row.id == null
      ? (row.messageId == null ? "local:index:" + String(index) : "local:" + String(row.messageId))
      : "db:" + String(row.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function withoutBigMoneyAlert(queue, handled) {
  if (!handled) return Array.isArray(queue) ? queue : [];
  return (Array.isArray(queue) ? queue : []).filter((entry) =>
    handled.id != null
      ? String(entry.id) !== String(handled.id)
      : entry !== handled
  );
}
