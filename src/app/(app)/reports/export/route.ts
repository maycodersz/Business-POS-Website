import {
  buildReportCsv,
  isReportExportType,
  reportExportFilename,
} from "@/features/reports/csv";
import { buildReportPdf } from "@/features/reports/pdf";
import { getReportsData } from "@/features/reports/queries";
import { getRequiredUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await getRequiredUser();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "";
  const range = url.searchParams.get("range") ?? "30d";
  const format = url.searchParams.get("format") ?? "csv";

  if (!isReportExportType(type)) {
    return new Response("Unknown report export type.", { status: 400 });
  }
  if (format !== "csv" && format !== "pdf") {
    return new Response("Unknown report export format.", { status: 400 });
  }

  const reports = await getReportsData(range);
  const body =
    format === "pdf" ? buildReportPdf(type, reports) : buildReportCsv(type, reports);
  const filename = reportExportFilename(type, reports.range.key, format);

  return new Response(body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type":
        format === "pdf" ? "application/pdf" : "text/csv; charset=utf-8",
    },
  });
}
