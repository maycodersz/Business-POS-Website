import {
  buildReportCsv,
  isReportExportType,
  reportExportFilename,
} from "@/features/reports/csv";
import { getReportsData } from "@/features/reports/queries";
import { getRequiredUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await getRequiredUser();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "";
  const range = url.searchParams.get("range") ?? "30d";

  if (!isReportExportType(type)) {
    return new Response("Unknown report export type.", { status: 400 });
  }

  const reports = await getReportsData(range);
  const csv = buildReportCsv(type, reports);
  const filename = reportExportFilename(type, reports.range.key);

  return new Response(csv, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
