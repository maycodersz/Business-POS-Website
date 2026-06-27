import { AddModal } from "@/features/add-modal/add-modal";
import { SuppliersView } from "@/features/suppliers/suppliers-view";
import { getSuppliers } from "@/features/suppliers/queries";

type SuppliersPageProps = {
  searchParams: Promise<{
    add?: string;
  }>;
};

export default async function SuppliersPage({
  searchParams,
}: SuppliersPageProps) {
  const { add } = await searchParams;
  const suppliers = await getSuppliers();

  return (
    <>
      <SuppliersView suppliers={suppliers} />
      <AddModal add={add} defaultKind="supplier" />
    </>
  );
}
