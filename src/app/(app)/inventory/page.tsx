import { AddModal } from "@/features/add-modal/add-modal";
import { InventoryView } from "@/features/inventory/inventory-view";
import { getInventoryMovements } from "@/features/inventory/queries";
import { getInventoryBatches } from "@/features/purchases/queries";

type InventoryPageProps = {
  searchParams: Promise<{
    add?: string;
    batch?: string;
  }>;
};

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const { add, batch } = await searchParams;
  const [batches, movements] = await Promise.all([
    getInventoryBatches(),
    getInventoryMovements(),
  ]);

  return (
    <>
      <InventoryView batches={batches} movements={movements} />
      <AddModal add={add} defaultKind="purchase" initialBatchId={batch} />
    </>
  );
}
