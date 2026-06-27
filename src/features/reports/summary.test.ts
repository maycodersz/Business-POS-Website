import { describe, expect, it } from "vitest";

import {
  buildProductPerformanceReport,
  buildSupplierPriceHistoryReport,
  pickDeadStockReportRows,
  summarizeProfitAndLossReport,
} from "./summary";

describe("summarizeProfitAndLossReport", () => {
  it("calculates report totals from sales, expenses, and inventory value", () => {
    expect(
      summarizeProfitAndLossReport({
        saleItems: [
          { revenue: 500, cogs: 230, gross_profit: 270 },
          { revenue: 300, cogs: 120, gross_profit: 180 },
        ],
        expenses: [{ amount: 75 }, { amount: 25 }],
        inventoryValue: 450,
      }),
    ).toEqual({
      totalRevenue: 800,
      totalCogs: 350,
      grossProfit: 450,
      totalExpenses: 100,
      netProfit: 350,
      inventoryValue: 450,
    });
  });
});

describe("buildProductPerformanceReport", () => {
  it("groups sold items by product and variant", () => {
    expect(
      buildProductPerformanceReport([
        {
          productId: "product-1",
          productName: "Mouse",
          variantId: "variant-1",
          variantName: "Black",
          quantitySold: 2,
          revenue: 500,
          grossProfit: 270,
        },
        {
          productId: "product-1",
          productName: "Mouse",
          variantId: "variant-1",
          variantName: "Black",
          quantitySold: 1,
          revenue: 250,
          grossProfit: 135,
        },
        {
          productId: "product-2",
          productName: "Keyboard",
          variantId: null,
          variantName: null,
          quantitySold: 1,
          revenue: 700,
          grossProfit: 300,
        },
      ]),
    ).toEqual([
      {
        productId: "product-1",
        productName: "Mouse",
        variantId: "variant-1",
        variantName: "Black",
        quantitySold: 3,
        revenue: 750,
        grossProfit: 405,
      },
      {
        productId: "product-2",
        productName: "Keyboard",
        variantId: null,
        variantName: null,
        quantitySold: 1,
        revenue: 700,
        grossProfit: 300,
      },
    ]);
  });
});

describe("buildSupplierPriceHistoryReport", () => {
  it("summarizes supplier purchase price ranges", () => {
    expect(
      buildSupplierPriceHistoryReport([
        {
          supplierId: "supplier-1",
          supplierName: "Supplier A",
          productId: "product-1",
          productName: "Mouse",
          variantId: null,
          variantName: null,
          purchaseDate: "2026-06-01",
          unitPrice: 100,
          landedUnitCost: 115,
        },
        {
          supplierId: "supplier-1",
          supplierName: "Supplier A",
          productId: "product-1",
          productName: "Mouse",
          variantId: null,
          variantName: null,
          purchaseDate: "2026-06-20",
          unitPrice: 120,
          landedUnitCost: 140,
        },
        {
          supplierId: "supplier-2",
          supplierName: "Supplier B",
          productId: "product-1",
          productName: "Mouse",
          variantId: null,
          variantName: null,
          purchaseDate: "2026-06-10",
          unitPrice: 95,
          landedUnitCost: 100,
        },
      ]),
    ).toEqual([
      {
        supplierId: "supplier-1",
        supplierName: "Supplier A",
        productId: "product-1",
        productName: "Mouse",
        variantId: null,
        variantName: null,
        purchases: 2,
        minUnitPrice: 100,
        maxUnitPrice: 120,
        latestUnitPrice: 120,
        latestLandedUnitCost: 140,
        latestPurchaseDate: "2026-06-20",
      },
      {
        supplierId: "supplier-2",
        supplierName: "Supplier B",
        productId: "product-1",
        productName: "Mouse",
        variantId: null,
        variantName: null,
        purchases: 1,
        minUnitPrice: 95,
        maxUnitPrice: 95,
        latestUnitPrice: 95,
        latestLandedUnitCost: 100,
        latestPurchaseDate: "2026-06-10",
      },
    ]);
  });
});

describe("pickDeadStockReportRows", () => {
  it("returns fully unsold batches older than 30 days", () => {
    const rows = pickDeadStockReportRows(
      [
        {
          id: "old-unsold",
          quantity: 2,
          quantityAvailable: 2,
          purchaseDate: "2026-05-01",
        },
        {
          id: "old-partial",
          quantity: 2,
          quantityAvailable: 1,
          purchaseDate: "2026-05-01",
        },
        {
          id: "new-unsold",
          quantity: 2,
          quantityAvailable: 2,
          purchaseDate: "2026-06-20",
        },
      ],
      "2026-06-27",
    );

    expect(rows.map((row) => row.id)).toEqual(["old-unsold"]);
  });
});
