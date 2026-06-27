import { notFound } from "next/navigation";

import { AddModal } from "@/features/add-modal/add-modal";
import { SaleDetailView } from "@/features/sales/sale-detail-view";
import { getSaleDetail } from "@/features/sales/queries";

type SaleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    add?: string;
  }>;
};

export default async function SaleDetailPage({
  params,
  searchParams,
}: SaleDetailPageProps) {
  const { id } = await params;
  const { add } = await searchParams;
  const sale = await getSaleDetail(id);

  if (!sale) {
    notFound();
  }

  return (
    <>
      <SaleDetailView sale={sale} />
      <AddModal add={add} defaultKind="sale" />
    </>
  );
}
