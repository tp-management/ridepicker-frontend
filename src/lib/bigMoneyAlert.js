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
