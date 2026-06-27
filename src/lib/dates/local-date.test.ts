import { describe, expect, it } from "vitest";

import { appDateInputValue } from "./local-date";

describe("appDateInputValue", () => {
  it("uses the Philippine calendar date instead of UTC", () => {
    expect(appDateInputValue(new Date("2026-06-27T16:30:00.000Z"))).toBe(
      "2026-06-28",
    );
  });

  it("keeps the same date during Philippine daytime", () => {
    expect(appDateInputValue(new Date("2026-06-28T04:00:00.000Z"))).toBe(
      "2026-06-28",
    );
  });
});
