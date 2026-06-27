import Link from "next/link";
import { Archive, Eye, Package, RotateCcw } from "lucide-react";

import {
  archiveProductAction,
  restoreProductAction,
} from "@/features/products/actions";
import { actionLinkClassName } from "@/components/ui/action-styles";
import { ProductDeleteForm } from "@/features/products/product-delete-form";
import { ProductForm } from "@/features/products/product-form";
import { VariantForm } from "@/features/products/variant-form";
import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

type Product = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  product_variants: Array<{
    id: string;
    variant_name: string;
    created_at: string;
  }>;
};

function ProductArticle({
  product,
  showArchive,
  showDelete,
  showRestore,
}: {
  product: Product;
  showArchive?: boolean;
  showDelete?: boolean;
  showRestore?: boolean;
}) {
  return (
    <article className="p-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-950">
            {product.name}
          </h3>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600">
            {product.status}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {product.description || "No description yet."}
        </p>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Variants
          </p>
          {product.product_variants.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.product_variants.map((variant) => (
                <span
                  key={variant.id}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
                >
                  {variant.variant_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No variants yet.</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/products/${product.id}`}
            className={actionLinkClassName}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            View
          </Link>
          {showArchive ? (
            <form action={archiveProductAction}>
              <input name="id" type="hidden" value={product.id} />
              <ConfirmSubmitButton
                message={`Archive ${product.name}?`}
                variant="secondary"
              >
                <Archive className="h-4 w-4" aria-hidden="true" />
                Archive
              </ConfirmSubmitButton>
            </form>
          ) : null}
          {showRestore ? (
            <form action={restoreProductAction}>
              <input name="id" type="hidden" value={product.id} />
              <ConfirmSubmitButton
                message={`Restore ${product.name} to active products?`}
                variant="secondary"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Restore
              </ConfirmSubmitButton>
            </form>
          ) : null}
          {showDelete ? (
            <ProductDeleteForm
              productId={product.id}
              productName={product.name}
            />
          ) : null}
          <ActionDisclosure label={`Edit ${product.name}`}>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-md bg-white p-4">
                <ProductForm product={product} />
              </div>
              <div className="rounded-md bg-white p-4">
                <VariantForm productId={product.id} />
              </div>
            </div>
          </ActionDisclosure>
        </div>
      </div>
    </article>
  );
}

export function ProductsView({
  products,
  search,
}: {
  products: Product[];
  search?: string;
}) {
  const activeProducts = products.filter((product) => product.status !== "archived");
  const archivedProducts = products.filter(
    (product) => product.status === "archived",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Products
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage products and variants before purchase tracking.
        </p>
      </div>

      <section>
        <div className="space-y-4">
          <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search products
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                name="q"
                placeholder="Search by product name"
                defaultValue={search}
              />
              <Button variant="secondary" type="submit">
                Search
              </Button>
            </div>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Product list
              </h2>
            </div>
            {activeProducts.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={Package}
                  title="No active products found"
                  description="Create products and variants here so purchases can attach to clean master records."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {activeProducts.map((product) => (
                  <ProductArticle
                    key={product.id}
                    product={product}
                    showArchive
                  />
                ))}
              </div>
            )}
          </div>

          {archivedProducts.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-950">
                  Archived products
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Archived products are hidden from the active product list and
                  purchase entry.
                </p>
              </div>
              <div className="divide-y divide-slate-200">
                {archivedProducts.map((product) => (
                  <ProductArticle
                    key={product.id}
                    product={product}
                    showDelete
                    showRestore
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

    </div>
  );
}
