import { describe, expect, it } from "vitest";

import { buildReportPdf } from "./pdf";

const reports = {
  range: {
    key: "30d",
    label: "Last 30 days",
  },
  profitAndLoss: {
    totalRevenue: 1000,
    totalCogs: 400,
    grossProfit: 600,
    totalExpenses: 100,
    netProfit: 500,
    inventoryValue: 2500,
  },
  sales: [],
  inventory: [],
  expenses: [],
  productPerformance: [],
  supplierPriceHistory: [],
  deadStock: [],
} as const;

describe("buildReportPdf", () => {
  it("builds a valid PDF response body", () => {
    const pdf = buildReportPdf("profit-loss", reports);
    const text = new TextDecoder().decode(pdf);

    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("Profit and loss");
    expect(text).toContain("Range: Last 30 days");
    expect(text).toContain("%%EOF");
  });

  it("includes an empty state for report types without rows", () => {
    const pdf = buildReportPdf("sales", reports);
    const text = new TextDecoder().decode(pdf);

    expect(text).toContain("Sales report");
    expect(text).toContain("No rows in this report.");
  });
});
