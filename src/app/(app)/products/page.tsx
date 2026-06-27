import { AddModal } from "@/features/add-modal/add-modal";
import { ProductsView } from "@/features/products/products-view";
import { getProducts } from "@/features/products/queries";

type ProductsPageProps = {
  searchParams: Promise<{
    add?: string;
    q?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { add, q } = await searchParams;
  const products = await getProducts(q);

  return (
    <>
      <ProductsView products={products} search={q} />
      <AddModal add={add} defaultKind="product" />
    </>
  );
}
