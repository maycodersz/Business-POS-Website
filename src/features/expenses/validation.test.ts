import { describe, expect, it } from "vitest";

import { normalizeExpenseForm, normalizeExpenseUpdateForm } from "./validation";

describe("normalizeExpenseForm", () => {
  it("normalizes expense form fields", () => {
    const formData = new FormData();
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "shipping");
    formData.set("amount", "120");
    formData.set("related_sale_id", "11111111-1111-4111-8111-111111111111");

    const result = normalizeExpenseForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual({
      expense_date: "2026-06-27",
      category: "shipping",
      amount: 120,
      related_sale_id: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("normalizes an empty related sale to null", () => {
    const formData = new FormData();
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "packaging");
    formData.set("amount", "35");
    formData.set("related_sale_id", "");

    const result = normalizeExpenseForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.related_sale_id).toBeNull();
  });

  it("accepts other expenses", () => {
    const formData = new FormData();
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "others");
    formData.set("amount", "99");
    formData.set("related_sale_id", "");

    const result = normalizeExpenseForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.category).toBe("others");
  });

  it("rejects unsupported expense categories", () => {
    const formData = new FormData();
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "software");
    formData.set("amount", "120");
    formData.set("related_sale_id", "");

    const result = normalizeExpenseForm(formData);

    expect(result.success).toBe(false);
  });

  it("rejects non-positive amounts", () => {
    const formData = new FormData();
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "labour");
    formData.set("amount", "0");
    formData.set("related_sale_id", "");

    const result = normalizeExpenseForm(formData);

    expect(result.success).toBe(false);
  });

  it("rejects decimal amounts", () => {
    const formData = new FormData();
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "shipping");
    formData.set("amount", "120.50");
    formData.set("related_sale_id", "");

    const result = normalizeExpenseForm(formData);

    expect(result).toEqual({
      success: false,
      message: "Amount must be a whole number.",
    });
  });
});

describe("normalizeExpenseUpdateForm", () => {
  it("normalizes expense update fields", () => {
    const formData = new FormData();
    formData.set("id", "22222222-2222-4222-8222-222222222222");
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "refund");
    formData.set("amount", "80");
    formData.set("related_sale_id", "");

    const result = normalizeExpenseUpdateForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual({
      id: "22222222-2222-4222-8222-222222222222",
      expense_date: "2026-06-27",
      category: "refund",
      amount: 80,
      related_sale_id: null,
    });
  });

  it("rejects expense updates without an expense id", () => {
    const formData = new FormData();
    formData.set("expense_date", "2026-06-27");
    formData.set("category", "refund");
    formData.set("amount", "80");
    formData.set("related_sale_id", "");

    const result = normalizeExpenseUpdateForm(formData);

    expect(result.success).toBe(false);
  });
});
