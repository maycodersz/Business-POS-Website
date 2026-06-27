import { notFound } from "next/navigation";

import { AddModal } from "@/features/add-modal/add-modal";
import { ProductDetailView } from "@/features/products/product-detail-view";
import { getProductDetail } from "@/features/products/queries";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    add?: string;
  }>;
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { id } = await params;
  const { add } = await searchParams;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductDetailView product={product} />
      <AddModal add={add} defaultKind="product" />
    </>
  );
}
