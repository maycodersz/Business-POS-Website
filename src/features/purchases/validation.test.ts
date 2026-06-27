import { describe, expect, it } from "vitest";

import { normalizePurchaseForm, normalizePurchaseUpdateForm } from "./validation";

describe("normalizePurchaseForm", () => {
  it("normalizes purchase form fields and calculates landed cost preview", () => {
    const formData = new FormData();
    formData.set("product_id", "11111111-1111-4111-8111-111111111111");
    formData.set("variant_id", "");
    formData.set("supplier_id", "22222222-2222-4222-8222-222222222222");
    formData.set("quantity", "5");
    formData.set("unit_price", "100");
    formData.set("purchase_date", "2026-06-27");
    formData.set("notes", "  negotiated bundle  ");

    const result = normalizePurchaseForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual({
      product_id: "11111111-1111-4111-8111-111111111111",
      new_product_name: null,
      variant_id: null,
      new_variant_name: null,
      supplier_id: "22222222-2222-4222-8222-222222222222",
      new_supplier_name: null,
      quantity: 5,
      unit_price: 100,
      shipping_fee: 0,
      other_fee: 0,
      purchase_date: "2026-06-27",
      notes: "negotiated bundle",
      quantity_available: 5,
      total_item_cost: 500,
      total_purchase_cost: 500,
      landed_unit_cost: 100,
      linked_expenses: [],
    });
  });

  it("normalizes linked purchase expenses from add purchase", () => {
    const formData = new FormData();
    formData.set("product_id", "11111111-1111-4111-8111-111111111111");
    formData.set("supplier_id", "22222222-2222-4222-8222-222222222222");
    formData.set("quantity", "5");
    formData.set("unit_price", "100");
    formData.set("purchase_date", "2026-06-27");
    formData.append("purchase_expense_category", "shipping");
    formData.append("purchase_expense_amount", "50");
    formData.append("purchase_expense_category", "others");
    formData.append("purchase_expense_amount", "25");

    const result = normalizePurchaseForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.linked_expenses).toEqual([
      { category: "shipping", amount: 50 },
      { category: "others", amount: 25 },
    ]);
    expect(result.data.total_purchase_cost).toBe(500);
    expect(result.data.landed_unit_cost).toBe(100);
  });

  it("rejects zero quantities before database constraints run", () => {
    const formData = new FormData();
    formData.set("product_id", "11111111-1111-4111-8111-111111111111");
    formData.set("supplier_id", "22222222-2222-4222-8222-222222222222");
    formData.set("quantity", "0");
    formData.set("unit_price", "100");
    formData.set("purchase_date", "2026-06-27");

    const result = normalizePurchaseForm(formData);

    expect(result.success).toBe(false);
  });

  it("allows purchase entry with new product, variant, and supplier names", () => {
    const formData = new FormData();
    formData.set("product_id", "");
    formData.set("new_product_name", "  Wireless Mouse  ");
    formData.set("variant_id", "");
    formData.set("new_variant_name", "  Black  ");
    formData.set("supplier_id", "");
    formData.set("new_supplier_name", "  Facebook Seller A  ");
    formData.set("quantity", "2");
    formData.set("unit_price", "150");
    formData.set("purchase_date", "2026-06-27");
    formData.set("notes", "");

    const result = normalizePurchaseForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.product_id).toBeNull();
    expect(result.data.new_product_name).toBe("Wireless Mouse");
    expect(result.data.variant_id).toBeNull();
    expect(result.data.new_variant_name).toBe("Black");
    expect(result.data.supplier_id).toBeNull();
    expect(result.data.new_supplier_name).toBe("Facebook Seller A");
    expect(result.data.total_purchase_cost).toBe(300);
    expect(result.data.landed_unit_cost).toBe(150);
  });
});

describe("normalizePurchaseUpdateForm", () => {
  it("normalizes safe purchase update fields", () => {
    const formData = new FormData();
    formData.set("id", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "4");
    formData.set("unit_price", "125");
    formData.set("purchase_date", "2026-06-27");
    formData.set("notes", "  corrected supplier invoice  ");

    const result = normalizePurchaseUpdateForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual({
      id: "33333333-3333-4333-8333-333333333333",
      quantity: 4,
      quantity_available: 4,
      unit_price: 125,
      shipping_fee: 0,
      other_fee: 0,
      purchase_date: "2026-06-27",
      notes: "corrected supplier invoice",
      total_item_cost: 500,
      total_purchase_cost: 500,
      landed_unit_cost: 125,
      linked_expenses: [],
    });
  });

  it("normalizes multiple linked purchase expenses", () => {
    const formData = new FormData();
    formData.set("id", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "4");
    formData.set("unit_price", "125");
    formData.set("purchase_date", "2026-06-27");
    formData.set("notes", "");
    formData.append("purchase_expense_category", "shipping");
    formData.append("purchase_expense_amount", "150");
    formData.append("purchase_expense_category", "others");
    formData.append("purchase_expense_amount", "25");

    const result = normalizePurchaseUpdateForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.linked_expenses).toEqual([
      { category: "shipping", amount: 150 },
      { category: "others", amount: 25 },
    ]);
  });

  it("rejects decimal purchase prices and linked expense amounts", () => {
    const formData = new FormData();
    formData.set("id", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "4");
    formData.set("unit_price", "125.25");
    formData.set("purchase_date", "2026-06-27");
    formData.append("purchase_expense_category", "shipping");
    formData.append("purchase_expense_amount", "150.50");

    const result = normalizePurchaseUpdateForm(formData);

    expect(result.success).toBe(false);
  });

  it("rejects incomplete linked purchase expense rows", () => {
    const formData = new FormData();
    formData.set("id", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "4");
    formData.set("unit_price", "125");
    formData.set("purchase_date", "2026-06-27");
    formData.append("purchase_expense_category", "shipping");
    formData.append("purchase_expense_amount", "");

    const result = normalizePurchaseUpdateForm(formData);

    expect(result).toEqual({
      success: false,
      message: "Enter an expense amount or remove the row.",
    });
  });

  it("rejects linked purchase expense amounts without a category", () => {
    const formData = new FormData();
    formData.set("id", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "4");
    formData.set("unit_price", "125");
    formData.set("purchase_date", "2026-06-27");
    formData.append("purchase_expense_category", "");
    formData.append("purchase_expense_amount", "150");

    const result = normalizePurchaseUpdateForm(formData);

    expect(result).toEqual({
      success: false,
      message: "Select an expense category for the amount you entered.",
    });
  });

  it("rejects invalid purchase update quantities", () => {
    const formData = new FormData();
    formData.set("id", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "0");
    formData.set("unit_price", "125");
    formData.set("purchase_date", "2026-06-27");

    const result = normalizePurchaseUpdateForm(formData);

    expect(result.success).toBe(false);
  });
});
