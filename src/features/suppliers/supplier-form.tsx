"use client";

import { useActionState } from "react";
import { Plus, Save } from "lucide-react";

import {
  createSupplierAction,
  updateSupplierAction,
  type SupplierActionState,
} from "@/features/suppliers/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/database";

type Supplier = Pick<
  Tables<"suppliers">,
  "id" | "name" | "facebook_link" | "messenger_link" | "notes"
>;

type SupplierFormProps = {
  supplier?: Supplier;
};

const initialState: SupplierActionState = {};

export function SupplierForm({ supplier }: SupplierFormProps) {
  const action = supplier ? updateSupplierAction : createSupplierAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {supplier ? <input name="id" type="hidden" value={supplier.id} /> : null}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Supplier name
        </label>
        <Input
          name="name"
          placeholder="Facebook Seller A"
          required
          defaultValue={supplier?.name}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Facebook link
          </label>
          <Input
            name="facebook_link"
            placeholder="https://facebook.com/..."
            type="url"
            defaultValue={supplier?.facebook_link ?? ""}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Messenger link
          </label>
          <Input
            name="messenger_link"
            placeholder="https://m.me/..."
            type="url"
            defaultValue={supplier?.messenger_link ?? ""}
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <Textarea
          name="notes"
          placeholder="Reliability, pricing notes, reminders"
          defaultValue={supplier?.notes ?? ""}
        />
      </div>
      <ActionFeedback ok={state.ok} message={state.message} />
      <SubmitButton>
        {supplier ? (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save supplier
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add supplier
          </>
        )}
      </SubmitButton>
    </form>
  );
}
