"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";

import {
  addVariantAction,
  type ProductActionState,
} from "@/features/products/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ProductActionState = {};

export function VariantForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(addVariantAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input name="product_id" type="hidden" value={productId} />
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Add variant
        </label>
        <Input name="variant_name" placeholder="Black, Large, 128GB" required />
      </div>
      <ActionFeedback ok={state.ok} message={state.message} />
      <SubmitButton variant="secondary">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add variant
      </SubmitButton>
    </form>
  );
}
