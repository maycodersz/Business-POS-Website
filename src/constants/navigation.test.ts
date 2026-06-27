import { describe, expect, it } from "vitest";

import {
  mobileAddNavigationItem,
  mobileMoreNavigationItem,
  mobileMoreNavigationItems,
  mobileNavigationItems,
} from "./navigation";

describe("mobile navigation", () => {
  it("keeps primary mobile navigation focused on core phone workflows", () => {
    expect([
      mobileNavigationItems[0].label,
      mobileNavigationItems[1].label,
      mobileAddNavigationItem.label,
      mobileNavigationItems[2].label,
      mobileMoreNavigationItem.label,
    ]).toEqual(["Dashboard", "Inventory", "Add", "Sales", "More"]);
  });

  it("keeps secondary pages reachable from More", () => {
    expect(mobileMoreNavigationItems.map((item) => item.label)).toEqual([
      "Products",
      "Purchases",
      "Expenses",
      "Suppliers",
      "Reports",
      "Settings",
    ]);
  });
});

