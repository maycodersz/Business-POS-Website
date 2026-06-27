"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import {
  deleteProductAction,
  type ProductActionState,
} from "@/features/products/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

type ProductDeleteFormProps = {
  productId: string;
  productName: string;
};

const initialState: ProductActionState = {};

export function ProductDeleteForm({
  productId,
  productName,
}: ProductDeleteFormProps) {
  const [state, formAction] = useActionState(
    deleteProductAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input name="id" type="hidden" value={productId} />
      <ConfirmSubmitButton
        message={`Permanently delete ${productName}? This will also remove its purchase, sale, and inventory history.`}
        variant="secondary"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </ConfirmSubmitButton>
      <ActionFeedback ok={state.ok} message={state.message} />
    </form>
  );
}
