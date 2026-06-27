import { AddModal } from "@/features/add-modal/add-modal";
import { SalesView } from "@/features/sales/sales-view";
import { getSales } from "@/features/sales/queries";

type SalesPageProps = {
  searchParams: Promise<{
    add?: string;
    batch?: string;
  }>;
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const { add, batch } = await searchParams;
  const sales = await getSales();

  return (
    <>
      <SalesView sales={sales} />
      <AddModal
        add={add ?? (batch ? "sale" : undefined)}
        defaultKind="sale"
        initialBatchId={batch}
      />
    </>
  );
}
