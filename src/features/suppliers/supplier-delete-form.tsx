"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import {
  deleteSupplierAction,
  type SupplierActionState,
} from "@/features/suppliers/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

type SupplierDeleteFormProps = {
  supplierId: string;
  supplierName: string;
};

const initialState: SupplierActionState = {};

export function SupplierDeleteForm({
  supplierId,
  supplierName,
}: SupplierDeleteFormProps) {
  const [state, formAction] = useActionState(
    deleteSupplierAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input name="id" type="hidden" value={supplierId} />
      <ConfirmSubmitButton
        message={`Delete ${supplierName}? Existing purchases will keep their history but show no supplier.`}
        variant="secondary"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </ConfirmSubmitButton>
      <ActionFeedback ok={state.ok} message={state.message} />
    </form>
  );
}
