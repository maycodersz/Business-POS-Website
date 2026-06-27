import { AddModal } from "@/features/add-modal/add-modal";
import { PurchasesView } from "@/features/purchases/purchases-view";
import { getPurchases } from "@/features/purchases/queries";

type PurchasesPageProps = {
  searchParams: Promise<{
    add?: string;
  }>;
};

export default async function PurchasesPage({
  searchParams,
}: PurchasesPageProps) {
  const { add } = await searchParams;
  const purchases = await getPurchases();

  return (
    <>
      <PurchasesView purchases={purchases} />
      <AddModal add={add} defaultKind="purchase" />
    </>
  );
}
