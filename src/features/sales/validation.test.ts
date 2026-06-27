import { describe, expect, it } from "vitest";

import { normalizeSaleForm, normalizeSaleUpdateForm } from "./validation";

describe("normalizeSaleForm", () => {
  it("normalizes sale form fields and calculates profit preview", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", "11111111-1111-4111-8111-111111111111");
    formData.set("quantity_sold", "2");
    formData.set("selling_price", "250");
    formData.set("sale_date", "2026-06-27");
    formData.set("customer_name", "  Ana  ");
    formData.set("platform", "  Facebook  ");
    formData.set("notes", "  paid cash  ");

    const result = normalizeSaleForm(formData, {
      id: "11111111-1111-4111-8111-111111111111",
      quantity_available: 3,
      landed_unit_cost: 115,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual({
      purchase_batch_id: "11111111-1111-4111-8111-111111111111",
      quantity_sold: 2,
      selling_price: 250,
      sale_date: "2026-06-27",
      customer_name: "Ana",
      platform: "Facebook",
      notes: "paid cash",
      sale_expense_category: null,
      sale_expense_amount: null,
      unit_cogs: 115,
      revenue: 500,
      cogs: 230,
      gross_profit: 270,
    });
  });

  it("normalizes an optional linked expense", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", "11111111-1111-4111-8111-111111111111");
    formData.set("quantity_sold", "1");
    formData.set("selling_price", "300");
    formData.set("sale_date", "2026-06-27");
    formData.set("sale_expense_category", "others");
    formData.set("sale_expense_amount", "45");

    const result = normalizeSaleForm(formData, {
      id: "11111111-1111-4111-8111-111111111111",
      quantity_available: 3,
      landed_unit_cost: 115,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.sale_expense_category).toBe("others");
    expect(result.data.sale_expense_amount).toBe(45);
  });

  it("rejects decimal selling prices and linked expenses", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", "11111111-1111-4111-8111-111111111111");
    formData.set("quantity_sold", "1");
    formData.set("selling_price", "300.50");
    formData.set("sale_date", "2026-06-27");
    formData.set("sale_expense_category", "others");
    formData.set("sale_expense_amount", "45.50");

    const result = normalizeSaleForm(formData, {
      id: "11111111-1111-4111-8111-111111111111",
      quantity_available: 3,
      landed_unit_cost: 115,
    });

    expect(result.success).toBe(false);
  });

  it("rejects incomplete linked expense fields", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", "11111111-1111-4111-8111-111111111111");
    formData.set("quantity_sold", "1");
    formData.set("selling_price", "300");
    formData.set("sale_date", "2026-06-27");
    formData.set("sale_expense_category", "others");

    const result = normalizeSaleForm(formData, {
      id: "11111111-1111-4111-8111-111111111111",
      quantity_available: 3,
      landed_unit_cost: 115,
    });

    expect(result).toEqual({
      success: false,
      message: "Choose an expense category and enter an amount, or leave both blank.",
    });
  });

  it("rejects sales that exceed available stock", () => {
    const formData = new FormData();
    formData.set("purchase_batch_id", "11111111-1111-4111-8111-111111111111");
    formData.set("quantity_sold", "4");
    formData.set("selling_price", "250");
    formData.set("sale_date", "2026-06-27");

    const result = normalizeSaleForm(formData, {
      id: "11111111-1111-4111-8111-111111111111",
      quantity_available: 3,
      landed_unit_cost: 115,
    });

    expect(result.success).toBe(false);
  });
});

describe("normalizeSaleUpdateForm", () => {
  it("normalizes sale updates within restock-adjusted capacity", () => {
    const formData = new FormData();
    formData.set("sale_id", "22222222-2222-4222-8222-222222222222");
    formData.set("quantity_sold", "4");
    formData.set("selling_price", "275");
    formData.set("sale_date", "2026-06-27");
    formData.set("customer_name", "  Mika  ");
    formData.set("platform", "  Shopee  ");
    formData.set("notes", "  changed qty  ");

    const result = normalizeSaleUpdateForm(formData, {
      quantity_sold: 2,
      batch_quantity_available: 3,
      unit_cogs: 115,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual({
      sale_id: "22222222-2222-4222-8222-222222222222",
      quantity_sold: 4,
      selling_price: 275,
      sale_date: "2026-06-27",
      customer_name: "Mika",
      platform: "Shopee",
      notes: "changed qty",
      unit_cogs: 115,
      revenue: 1100,
      cogs: 460,
      gross_profit: 640,
    });
  });

  it("rejects sale updates beyond available batch capacity", () => {
    const formData = new FormData();
    formData.set("sale_id", "22222222-2222-4222-8222-222222222222");
    formData.set("quantity_sold", "6");
    formData.set("selling_price", "275");
    formData.set("sale_date", "2026-06-27");

    const result = normalizeSaleUpdateForm(formData, {
      quantity_sold: 2,
      batch_quantity_available: 3,
      unit_cogs: 115,
    });

    expect(result.success).toBe(false);
  });
});
