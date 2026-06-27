import { describe, expect, it } from "vitest";

import { reportExportFilename, rowsToCsv } from "./csv";

describe("rowsToCsv", () => {
  it("escapes commas, quotes, and line breaks", () => {
    expect(
      rowsToCsv([
        {
          product: 'Mouse, "Black"',
          notes: "first line\nsecond line",
          quantity: 2,
        },
      ]),
    ).toBe(
      'product,notes,quantity\r\n"Mouse, ""Black""","first line\nsecond line",2',
    );
  });

  it("returns an empty file body for empty rows", () => {
    expect(rowsToCsv([])).toBe("");
  });
});

describe("reportExportFilename", () => {
  it("builds stable CSV filenames", () => {
    expect(reportExportFilename("sales", "30d")).toBe(
      "resellops-sales-30d.csv",
    );
  });

  it("builds stable PDF filenames", () => {
    expect(reportExportFilename("sales", "30d", "pdf")).toBe(
      "resellops-sales-30d.pdf",
    );
  });
});
