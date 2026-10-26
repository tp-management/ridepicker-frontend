import test from "node:test";
import assert from "node:assert/strict";
import { activityPriority, filterAndSortActivity } from "../src/lib/activityPriority.js";

const entries = [
  { id: "new-regular", type: "message", priority: "regular", time: "2026-10-26T12:00:00Z" },
  { id: "old-high", type: "message", priority: "high", time: "2026-10-24T12:00:00Z" },
  { id: "new-high", type: "job", priority: "high", time: "2026-10-25T12:00:00Z" },
  { id: "legacy", type: "job", time: "2026-10-23T12:00:00Z" },
];

test("High entries appear before Regular; both groups are newest first", () => {
  assert.deepEqual(
    filterAndSortActivity(entries).map((entry) => entry.id),
    ["new-high", "old-high", "new-regular", "legacy"]
  );
});

test("legacy entries default to Regular and type/priority filters combine", () => {
  assert.equal(activityPriority({}), "regular");
  assert.equal(activityPriority({ priority: "high" }), "high");
  assert.deepEqual(
    filterAndSortActivity(entries, { type: "job", priority: "regular" }).map((e) => e.id),
    ["legacy"]
  );
  assert.deepEqual(
    filterAndSortActivity(entries, { type: "message", priority: "high" }).map((e) => e.id),
    ["old-high"]
  );
});

test("sorting does not mutate the input and remains stable without timestamps", () => {
  const missing = [
    { id: "a", priority: "regular" },
    { id: "b" },
    { id: "c", priority: "high", time: "not-a-date" },
  ];
  assert.deepEqual(filterAndSortActivity(missing).map((e) => e.id), ["c", "a", "b"]);
  assert.deepEqual(missing.map((e) => e.id), ["a", "b", "c"]);
  assert.deepEqual(filterAndSortActivity(null), []);
});
