"use client";

import { useActionState, useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";

import {
  deleteSaleAction,
  updateSaleAction,
  type SaleActionState,
} from "@/features/sales/actions";
import type { SaleRow } from "@/features/sales/queries";
import {
  calculateCOGS,
  calculateGrossProfit,
  calculateSaleRevenue,
} from "@/lib/calculations/inventory";
import { formatMoney } from "@/lib/formatters/money";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type SaleEditFormProps = {
  sale: SaleRow;
};

const initialState: SaleActionState = {};

export function SaleEditForm({ sale }: SaleEditFormProps) {
  const item = sale.sale_items[0] ?? null;
  const [updateState, updateFormAction] = useActionState(
    updateSaleAction,
    initialState,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteSaleAction,
    initialState,
  );
  const [quantitySold, setQuantitySold] = useState(item?.quantity_sold ?? 1);
  const [sellingPrice, setSellingPrice] = useState(
    item ? String(Math.round(item.selling_price)) : "",
  );

  const maxQuantity =
    (item?.quantity_sold ?? 0) +
    (item?.purchase_batches?.quantity_available ?? 0);

  const preview = useMemo(() => {
    const unitCogs = item?.unit_cogs ?? 0;
    const revenue = calculateSaleRevenue(quantitySold, Number(sellingPrice || 0));
    const cogs = calculateCOGS(quantitySold, unitCogs);

    return {
      revenue,
      cogs,
      grossProfit: calculateGrossProfit(revenue, cogs),
    };
  }, [item, quantitySold, sellingPrice]);

  if (!item) {
    return (
      <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
        This sale has no editable item record.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <form action={updateFormAction} className="space-y-5">
        <input name="sale_id" type="hidden" value={sale.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Quantity sold
            </label>
            <Input
              max={maxQuantity}
              min={1}
              name="quantity_sold"
              required
              step={1}
              type="number"
              value={quantitySold}
              onChange={(event) => setQuantitySold(Number(event.target.value))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Selling price
            </label>
            <Input
              min={0}
              name="selling_price"
              required
              step={1}
              type="number"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Sale date
          </label>
          <Input
            defaultValue={sale.sale_date}
            name="sale_date"
            required
            type="date"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Platform
            </label>
            <Input
              defaultValue={sale.platform ?? ""}
              name="platform"
              placeholder="Facebook, Messenger, TikTok"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Customer name
            </label>
            <Input
              defaultValue={sale.customer_name ?? ""}
              name="customer_name"
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <Textarea
            defaultValue={sale.notes ?? ""}
            name="notes"
            placeholder="Discount, negotiation, delivery"
          />
        </div>

        <dl className="grid gap-3 rounded-md bg-white p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Revenue</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(preview.revenue)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">COGS</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(preview.cogs)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Gross profit</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(preview.grossProfit)}
            </dd>
          </div>
        </dl>

        <ActionFeedback ok={updateState.ok} message={updateState.message} />
        <SubmitButton>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save sale
        </SubmitButton>
      </form>

      <form action={deleteFormAction} className="border-t border-slate-200 pt-4">
        <input name="sale_id" type="hidden" value={sale.id} />
        <ActionFeedback ok={deleteState.ok} message={deleteState.message} />
        <div className="mt-3">
          <ConfirmSubmitButton
            message="Delete this sale and restore stock? This cannot be undone."
            variant="secondary"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete sale
          </ConfirmSubmitButton>
        </div>
      </form>
    </div>
  );
}
