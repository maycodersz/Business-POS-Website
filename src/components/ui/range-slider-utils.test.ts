import { describe, expect, it } from "vitest";

import { activeRangeIndex, buildRangeHref } from "./range-slider-utils";

const ranges = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

describe("range slider helpers", () => {
  it("finds the active range index", () => {
    expect(activeRangeIndex(ranges, "90d")).toBe(2);
  });

  it("falls back to the first range for unknown keys", () => {
    expect(activeRangeIndex(ranges, "bad")).toBe(0);
  });

  it("builds range URLs", () => {
    expect(buildRangeHref("/reports", "30d")).toBe("/reports?range=30d");
  });
});

