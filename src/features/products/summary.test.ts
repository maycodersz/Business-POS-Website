import { describe, expect, it } from "vitest";

import { summarizeProductInventory } from "./summary";

describe("summarizeProductInventory", () => {
  it("summarizes batch-level stock, inventory value, and average landed cost", () => {
    const summary = summarizeProductInventory([
      {
        quantity: 5,
        quantity_available: 3,
        landed_unit_cost: 115,
        total_purchase_cost: 575,
      },
      {
        quantity: 2,
        quantity_available: 2,
        landed_unit_cost: 150,
        total_purchase_cost: 300,
      },
      {
        quantity: 4,
        quantity_available: 0,
        landed_unit_cost: 90,
        total_purchase_cost: 360,
      },
    ]);

    expect(summary).toEqual({
      batchCount: 3,
      activeBatchCount: 2,
      totalPurchasedQuantity: 11,
      totalAvailableQuantity: 5,
      inventoryValue: 645,
      inventoryCashSpent: 1235,
      averageLandedCost: 129,
    });
  });

  it("returns zero totals when there are no batches", () => {
    expect(summarizeProductInventory([])).toEqual({
      batchCount: 0,
      activeBatchCount: 0,
      totalPurchasedQuantity: 0,
      totalAvailableQuantity: 0,
      inventoryValue: 0,
      inventoryCashSpent: 0,
      averageLandedCost: 0,
    });
  });
});
