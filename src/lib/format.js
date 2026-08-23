import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";

export function formatJobTime(iso) {
  const d = new Date(iso);
  const day = isToday(d) ? "Today" : isTomorrow(d) ? "Tomorrow" : format(d, "EEE d MMM");
  return `${day} · ${format(d, "HH:mm")}`;
}

export function formatRelative(iso) {
  if (!iso) return "";
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatFull(iso) {
  return format(new Date(iso), "EEE d MMM yyyy · HH:mm");
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export const priceLabel = (n) => (n == null ? "TBC" : `£${n}`);