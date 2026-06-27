import {
  reportExportLabels,
  reportRows,
  type ReportExportType,
} from "@/features/reports/csv";
import type { getReportsData } from "@/features/reports/queries";
import { appDateInputValue } from "@/lib/dates/local-date";

type ReportsData = Awaited<ReturnType<typeof getReportsData>>;

const pageWidth = 595;
const pageHeight = 842;
const margin = 40;
const lineHeight = 14;
const bodyFontSize = 9;
const maxLineLength = 92;

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatCell(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : String(Math.round(value));
  }

  return cleanText(value);
}

function wrapLine(line: string, maxLength = maxLineLength) {
  const words = cleanText(line).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxLength) {
      if (current) {
        lines.push(current);
        current = "";
      }

      for (let index = 0; index < word.length; index += maxLength) {
        lines.push(word.slice(index, index + maxLength));
      }
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function rowToLines(row: Record<string, unknown>) {
  const fields = Object.entries(row).map(([key, value]) => {
    const label = key.replaceAll("_", " ");
    return `${label}: ${formatCell(value)}`;
  });

  return wrapLine(fields.join(" | "));
}

function buildPdfPage(lines: string[], pageNumber: number) {
  const commands = [
    "BT",
    `/F1 ${bodyFontSize} Tf`,
    `${margin} ${pageHeight - margin} Td`,
  ];

  lines.forEach((line, index) => {
    if (index > 0) {
      commands.push(`0 -${lineHeight} Td`);
    }
    commands.push(`(${pdfText(line)}) Tj`);
  });

  commands.push(
    "ET",
    "BT",
    `/F1 8 Tf`,
    `${pageWidth - margin - 55} ${margin / 2} Td`,
    `(Page ${pageNumber}) Tj`,
    "ET",
  );

  return commands.join("\n");
}

function paginate(lines: string[]) {
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage));
  }

  return pages.length > 0 ? pages : [["No rows in this report."]];
}

function buildPdfBytes(pageContents: string[]) {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const fontObjectId = 3;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";

  pageContents.forEach((content, index) => {
    const pageObjectId = 4 + index * 2;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] =
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  objects[2] =
    `<< /Type /Pages /Kids [${pageObjectIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pageObjectIds.length} >>`;
  objects[fontObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const orderedIds = Array.from(
    { length: 3 + pageContents.length * 2 },
    (_, index) => index + 1,
  );
  let output = "%PDF-1.4\n";
  const offsets = [0];

  orderedIds.forEach((id) => {
    offsets[id] = output.length;
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  });

  const xrefOffset = output.length;
  output += `xref\n0 ${orderedIds.length + 1}\n`;
  output += "0000000000 65535 f \n";
  orderedIds.forEach((id) => {
    output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  });
  output += `trailer\n<< /Size ${orderedIds.length + 1} /Root 1 0 R >>\n`;
  output += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(output);
}

export function buildReportPdf(type: ReportExportType, reports: ReportsData) {
  const rows = reportRows(type, reports);
  const lines = [
    reportExportLabels[type],
    `Range: ${reports.range.label}`,
    `Generated: ${appDateInputValue()}`,
    "",
  ];

  if (type === "profit-loss") {
    lines.push("Summary");
  } else {
    lines.push(`${rows.length} rows`);
  }

  lines.push("");

  if (rows.length === 0) {
    lines.push("No rows in this report.");
  } else {
    rows.forEach((row, index) => {
      lines.push(`${index + 1}.`);
      lines.push(...rowToLines(row));
      lines.push("");
    });
  }

  const pages = paginate(lines);
  const pageContents = pages.map((pageLines, index) =>
    buildPdfPage(pageLines, index + 1),
  );

  return buildPdfBytes(pageContents);
}
