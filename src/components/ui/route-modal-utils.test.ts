import { describe, expect, it } from "vitest";

import { buildModalCloseHref } from "./route-modal-utils";

describe("buildModalCloseHref", () => {
  it("removes modal-only query params", () => {
    expect(buildModalCloseHref("/reports", "range=30d&add=sale&batch=abc")).toBe(
      "/reports?range=30d",
    );
  });

  it("returns the pathname when no query params remain", () => {
    expect(buildModalCloseHref("/inventory", "add=sale&batch=abc")).toBe(
      "/inventory",
    );
  });
});
