// Priority is a user-controlled label on Activity entries, not a job status.
export function activityPriority(entry) {
  return entry?.priority === "high" ? "high" : "regular";
}

function activityTime(entry) {
  const timestamp = new Date(entry?.time || "").getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

// High first, newest first within each priority. Stable for equal/invalid dates.
// Filtering never mutates the shared ProductContext Activity list.
export function filterAndSortActivity(entries, { type = "all", priority = "all" } = {}) {
  return (Array.isArray(entries) ? entries : [])
    .filter(
      (entry) =>
        (type === "all" || entry.type === type) &&
        (priority === "all" || activityPriority(entry) === priority)
    )
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const priorityDifference =
        Number(activityPriority(b.entry) === "high") -
        Number(activityPriority(a.entry) === "high");
      if (priorityDifference) return priorityDifference;

      const timeDifference = activityTime(b.entry) - activityTime(a.entry);
      return Number.isNaN(timeDifference) || !timeDifference
        ? a.index - b.index
        : timeDifference;
    })
    .map(({ entry }) => entry);
}
