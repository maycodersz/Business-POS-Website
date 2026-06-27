import { RouteModal } from "@/components/ui/route-modal";
import { ExpenseForm } from "@/features/expenses/expense-form";
import { getExpenseSaleOptions } from "@/features/expenses/queries";
import { ProductForm } from "@/features/products/product-form";
import { PurchaseForm } from "@/features/purchases/purchase-form";
import { getPurchaseFormOptions } from "@/features/purchases/queries";
import { SaleForm } from "@/features/sales/sale-form";
import { getAvailableSaleBatches } from "@/features/sales/queries";
import { SupplierForm } from "@/features/suppliers/supplier-form";
import type { AddKind } from "@/features/add-modal/types";

type AddModalProps = {
  add?: string;
  defaultKind: AddKind;
  initialBatchId?: string;
};

function normalizeAddKind(add: string | undefined, defaultKind: AddKind) {
  if (!add) {
    return null;
  }

  if (add === "1") {
    return defaultKind;
  }

  if (add === "sales") {
    return "sale";
  }

  if (
    add === "product" ||
    add === "purchase" ||
    add === "sale" ||
    add === "expense" ||
    add === "supplier"
  ) {
    return add;
  }

  return null;
}

export async function AddModal({
  add,
  defaultKind,
  initialBatchId,
}: AddModalProps) {
  const kind = normalizeAddKind(add, defaultKind);

  if (!kind) {
    return null;
  }

  if (kind === "product") {
    return (
      <RouteModal title="Add product">
        <ProductForm />
      </RouteModal>
    );
  }

  if (kind === "purchase") {
    const { products, suppliers } = await getPurchaseFormOptions();

    return (
      <RouteModal title="Add purchase">
        <PurchaseForm products={products} suppliers={suppliers} />
      </RouteModal>
    );
  }

  if (kind === "sale") {
    const batches = await getAvailableSaleBatches();

    return (
      <RouteModal title="Add sales">
        <SaleForm batches={batches} initialBatchId={initialBatchId} />
      </RouteModal>
    );
  }

  if (kind === "expense") {
    const sales = await getExpenseSaleOptions();

    return (
      <RouteModal title="Add expense">
        <ExpenseForm sales={sales} />
      </RouteModal>
    );
  }

  return (
    <RouteModal title="Add supplier">
      <SupplierForm />
    </RouteModal>
  );
}
