import { describe, expect, it } from "vitest";

import { normalizeInventoryAdjustmentForm } from "./adjustment-validation";

const batch = {
  id: "11111111-1111-4111-8111-111111111111",
  quantity: 5,
  quantity_available: 3,
};

describe("normalizeInventoryAdjustmentForm", () => {
  it("normalizes a valid stock adjustment", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", batch.id);
    formData.set("quantity_delta", "-2");
    formData.set("notes", "  damaged during packing  ");

    const result = normalizeInventoryAdjustmentForm(formData, batch);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual({
      purchase_batch_id: batch.id,
      quantity_delta: -2,
      notes: "damaged during packing",
      resulting_quantity_available: 1,
    });
  });

  it("rejects zero adjustments", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", batch.id);
    formData.set("quantity_delta", "0");
    formData.set("notes", "counted stock");

    const result = normalizeInventoryAdjustmentForm(formData, batch);

    expect(result.success).toBe(false);
  });

  it("rejects adjustments that would make stock negative", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", batch.id);
    formData.set("quantity_delta", "-4");
    formData.set("notes", "lost stock");

    const result = normalizeInventoryAdjustmentForm(formData, batch);

    expect(result.success).toBe(false);
  });

  it("rejects adjustments above the purchased quantity", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", batch.id);
    formData.set("quantity_delta", "3");
    formData.set("notes", "found stock");

    const result = normalizeInventoryAdjustmentForm(formData, batch);

    expect(result.success).toBe(false);
  });
});
