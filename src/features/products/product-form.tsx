"use client";

import { useActionState, useState } from "react";
import { Plus, Save, X } from "lucide-react";

import {
  createProductAction,
  updateProductAction,
  type ProductActionState,
} from "@/features/products/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/database";

type Product = Pick<Tables<"products">, "id" | "name" | "description">;

const initialState: ProductActionState = {};

export function ProductForm({ product }: { product?: Product }) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction] = useActionState(action, initialState);
  const [initialVariantName, setInitialVariantName] = useState("");
  const [initialVariantNames, setInitialVariantNames] = useState<string[]>([]);

  function addInitialVariant() {
    const normalizedName = initialVariantName.trim();

    if (!normalizedName) {
      return;
    }

    setInitialVariantNames((current) =>
      current.some(
        (variantName) =>
          variantName.toLocaleLowerCase() ===
          normalizedName.toLocaleLowerCase(),
      )
        ? current
        : [...current, normalizedName],
    );
    setInitialVariantName("");
  }

  return (
    <form action={formAction} className="space-y-5">
      {product ? <input name="id" type="hidden" value={product.id} /> : null}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Product name
        </label>
        <Input
          name="name"
          placeholder="RGD, Carnival, etc."
          required
          defaultValue={product?.name}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>
        <Textarea
          name="description"
          placeholder="Optional product notes"
          defaultValue={product?.description ?? ""}
        />
      </div>
      {!product ? (
        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Add variant
          </label>
          <Input
            placeholder="Black, Red, Blue, etc."
            value={initialVariantName}
            onChange={(event) => setInitialVariantName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addInitialVariant();
              }
            }}
          />
          <Button
            disabled={initialVariantName.trim().length === 0}
            variant="secondary"
            type="button"
            onClick={addInitialVariant}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add variant
          </Button>
          {initialVariantNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {initialVariantNames.map((variantName) => (
                <span
                  key={variantName}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                >
                  <input
                    name="initial_variant_names"
                    type="hidden"
                    value={variantName}
                  />
                  {variantName}
                  <button
                    aria-label={`Remove ${variantName}`}
                    className="touch-manipulation rounded-sm text-slate-500 transition hover:text-slate-950 active:scale-95 active:text-slate-950"
                    type="button"
                    onClick={() =>
                      setInitialVariantNames((current) =>
                        current.filter((name) => name !== variantName),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <ActionFeedback ok={state.ok} message={state.message} />
      <SubmitButton>
        {product ? (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save product
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </>
        )}
      </SubmitButton>
    </form>
  );
}
