import { describe, expect, it } from "vitest";

import {
  buildDailyDashboardSeries,
  normalizeDashboardRange,
  pickInventoryAlerts,
  summarizeDashboard,
  summarizeExpenseCategories,
} from "./summary";

describe("summarizeDashboard", () => {
  it("calculates revenue, costs, expenses, inventory value, alerts, and net profit", () => {
    const summary = summarizeDashboard({
      saleItems: [
        { revenue: 500, cogs: 230, gross_profit: 270 },
        { revenue: 300, cogs: 120, gross_profit: 180 },
      ],
      expenses: [{ amount: 100 }, { amount: 50 }],
      batches: [
        {
          quantity: 2,
          quantity_available: 2,
          landed_unit_cost: 115,
          total_purchase_cost: 230,
          purchase_date: "2026-05-01",
        },
        {
          quantity: 5,
          quantity_available: 1,
          landed_unit_cost: 80,
          total_purchase_cost: 400,
          purchase_date: "2026-06-20",
        },
        {
          quantity: 3,
          quantity_available: 0,
          landed_unit_cost: 70,
          total_purchase_cost: 210,
          purchase_date: "2026-06-21",
        },
      ],
      referenceDate: "2026-06-27",
    });

    expect(summary).toEqual({
      totalRevenue: 800,
      totalCogs: 350,
      grossProfit: 450,
      totalExpenses: 150,
      netProfit: 300,
      inventoryValue: 310,
      inventoryCashSpent: 840,
      unsoldStock: 3,
      lowStockCount: 2,
      deadStockCount: 1,
    });
  });

  it("calculates totals from every row passed in, not only the first page of activity", () => {
    const saleItems = Array.from({ length: 25 }, () => ({
      revenue: 100,
      cogs: 40,
      gross_profit: 60,
    }));
    const expenses = Array.from({ length: 25 }, () => ({ amount: 5 }));

    const summary = summarizeDashboard({
      saleItems,
      expenses,
      batches: [],
      referenceDate: "2026-06-27",
    });

    expect(summary.totalRevenue).toBe(2500);
    expect(summary.totalCogs).toBe(1000);
    expect(summary.grossProfit).toBe(1500);
    expect(summary.totalExpenses).toBe(125);
    expect(summary.netProfit).toBe(1375);
  });
});

describe("normalizeDashboardRange", () => {
  it("defaults to 30 days and calculates an inclusive start date", () => {
    expect(normalizeDashboardRange(undefined, "2026-06-27")).toEqual({
      key: "30d",
      label: "Last 30 days",
      startDate: "2026-05-29",
      endDate: "2026-06-27",
    });
  });

  it("normalizes unsupported ranges back to 30 days", () => {
    expect(normalizeDashboardRange("bad", "2026-06-27").key).toBe("30d");
  });
});

describe("buildDailyDashboardSeries", () => {
  it("groups sales and expenses by day and fills missing range dates", () => {
    const range = normalizeDashboardRange("7d", "2026-06-27");

    const series = buildDailyDashboardSeries({
      range,
      saleItems: [
        {
          sale_date: "2026-06-25",
          revenue: 500,
          cogs: 230,
          gross_profit: 270,
        },
      ],
      expenses: [
        { expense_date: "2026-06-25", amount: 50 },
        { expense_date: "2026-06-27", amount: 25 },
      ],
    });

    expect(series).toHaveLength(7);
    expect(series.at(0)).toEqual({
      date: "2026-06-21",
      revenue: 0,
      expenses: 0,
      grossProfit: 0,
      netProfit: 0,
    });
    expect(series.at(4)).toEqual({
      date: "2026-06-25",
      revenue: 500,
      expenses: 50,
      grossProfit: 270,
      netProfit: 220,
    });
    expect(series.at(6)?.netProfit).toBe(-25);
  });
});

describe("summarizeExpenseCategories", () => {
  it("returns fixed expense categories with totals", () => {
    expect(
      summarizeExpenseCategories([
        { category: "shipping", amount: 100 },
        { category: "shipping", amount: 25 },
        { category: "labour", amount: 40 },
      ]),
    ).toEqual([
      { category: "shipping", amount: 125 },
      { category: "packaging", amount: 0 },
      { category: "refund", amount: 0 },
      { category: "labour", amount: 40 },
    ]);
  });
});

describe("pickInventoryAlerts", () => {
  it("returns low-stock and dead-stock batches", () => {
    const alerts = pickInventoryAlerts(
      [
        {
          quantity: 2,
          quantity_available: 2,
          landed_unit_cost: 115,
          total_purchase_cost: 230,
          purchase_date: "2026-05-01",
        },
        {
          quantity: 10,
          quantity_available: 4,
          landed_unit_cost: 90,
          total_purchase_cost: 900,
          purchase_date: "2026-06-20",
        },
        {
          quantity: 5,
          quantity_available: 1,
          landed_unit_cost: 80,
          total_purchase_cost: 400,
          purchase_date: "2026-06-20",
        },
      ],
      "2026-06-27",
    );

    expect(alerts.lowStock).toHaveLength(2);
    expect(alerts.deadStock).toHaveLength(1);
  });
});
