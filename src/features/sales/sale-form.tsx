"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import {
  createSaleAction,
  type SaleActionState,
} from "@/features/sales/actions";
import type { AvailableSaleBatch } from "@/features/sales/queries";
import {
  calculateCOGS,
  calculateGrossProfit,
  calculateSaleRevenue,
} from "@/lib/calculations/inventory";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type SaleFormProps = {
  batches: AvailableSaleBatch[];
  initialBatchId?: string;
};

const initialState: SaleActionState = {};

const fieldClass =
  "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:h-10 sm:text-sm";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value);
}

function batchLabel(batch: AvailableSaleBatch) {
  const variant = batch.product_variants?.variant_name ?? "No variant";
  const supplier = batch.suppliers?.name ?? "Unknown supplier";
  return `${batch.products?.name ?? "Unknown product"} - ${variant} - ${supplier} (${batch.quantity_available} available)`;
}

export function SaleForm({ batches, initialBatchId }: SaleFormProps) {
  const [state, formAction] = useActionState(createSaleAction, initialState);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId ?? "");
  const [quantitySold, setQuantitySold] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(0);

  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId);
  const maxQuantity = selectedBatch?.quantity_available ?? 1;

  const preview = useMemo(() => {
    const unitCogs = selectedBatch?.landed_unit_cost ?? 0;
    const revenue = calculateSaleRevenue(quantitySold, sellingPrice);
    const cogs = calculateCOGS(quantitySold, unitCogs);

    return {
      revenue,
      cogs,
      grossProfit: calculateGrossProfit(revenue, cogs),
    };
  }, [quantitySold, selectedBatch, sellingPrice]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Inventory batch
        </label>
        <select
          name="purchase_batch_id"
          required
          className={fieldClass}
          value={selectedBatchId}
          onChange={(event) => setSelectedBatchId(event.target.value)}
        >
          <option value="">Select available batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batchLabel(batch)}
            </option>
          ))}
        </select>
      </div>

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
            step="0.01"
            type="number"
            value={sellingPrice}
            onChange={(event) => setSellingPrice(Number(event.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Sale date
        </label>
        <Input
          defaultValue={todayInputValue()}
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
          <Input name="platform" placeholder="Facebook, Messenger, TikTok" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Customer name
          </label>
          <Input name="customer_name" placeholder="Optional" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <Textarea name="notes" placeholder="Discount, negotiation, delivery" />
      </div>

      <dl className="grid gap-3 rounded-md bg-slate-50 p-4 text-sm sm:grid-cols-3">
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

      <ActionFeedback ok={state.ok} message={state.message} />

      <SubmitButton>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add sales
      </SubmitButton>
    </form>
  );
}
