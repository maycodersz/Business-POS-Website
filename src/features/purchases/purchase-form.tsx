"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import {
  createPurchaseAction,
  type PurchaseActionState,
} from "@/features/purchases/actions";
import type {
  PurchaseProductOption,
  PurchaseSupplierOption,
} from "@/features/purchases/queries";
import {
  calculateLandedUnitCost,
  calculateTotalItemCost,
  calculateTotalPurchaseCost,
} from "@/lib/calculations/inventory";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type PurchaseFormProps = {
  products: PurchaseProductOption[];
  suppliers: PurchaseSupplierOption[];
};

const initialState: PurchaseActionState = {};

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

export function PurchaseForm({ products, suppliers }: PurchaseFormProps) {
  const [state, formAction] = useActionState(
    createPurchaseAction,
    initialState,
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [otherFee, setOtherFee] = useState(0);

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId,
  );
  const variants = selectedProduct?.product_variants ?? [];

  const preview = useMemo(() => {
    const totalItemCost = calculateTotalItemCost(quantity, unitPrice);
    const totalPurchaseCost = calculateTotalPurchaseCost(
      quantity,
      unitPrice,
      shippingFee,
      otherFee,
    );

    return {
      totalItemCost,
      totalPurchaseCost,
      landedUnitCost: calculateLandedUnitCost(
        quantity,
        unitPrice,
        shippingFee,
        otherFee,
      ),
    };
  }, [quantity, unitPrice, shippingFee, otherFee]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Product
        </label>
        <select
          name="product_id"
          className={fieldClass}
          value={selectedProductId}
          onChange={(event) => setSelectedProductId(event.target.value)}
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          New product name
        </label>
        <Input
          name="new_product_name"
          placeholder="Use when the product is not in the list"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Variant
        </label>
        <select name="variant_id" className={fieldClass}>
          <option value="">No variant</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.variant_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          New variant
        </label>
        <Input
          name="new_variant_name"
          placeholder="Black, Large, 128GB"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Supplier
        </label>
        <select name="supplier_id" className={fieldClass}>
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          New supplier name
        </label>
        <Input
          name="new_supplier_name"
          placeholder="Use when the supplier is not in the list"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Quantity
          </label>
          <Input
            min={1}
            name="quantity"
            required
            step={1}
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Unit price
          </label>
          <Input
            min={0}
            name="unit_price"
            required
            step="0.01"
            type="number"
            value={unitPrice}
            onChange={(event) => setUnitPrice(Number(event.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Shipping fee
          </label>
          <Input
            min={0}
            name="shipping_fee"
            step="0.01"
            type="number"
            value={shippingFee}
            onChange={(event) => setShippingFee(Number(event.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Other fee
          </label>
          <Input
            min={0}
            name="other_fee"
            step="0.01"
            type="number"
            value={otherFee}
            onChange={(event) => setOtherFee(Number(event.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Purchase date
        </label>
        <Input
          defaultValue={todayInputValue()}
          name="purchase_date"
          required
          type="date"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <Textarea
          name="notes"
          placeholder="Negotiation notes, demand reason, or supplier context"
        />
      </div>

      <dl className="grid gap-3 rounded-md bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">Item cost</dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {formatMoney(preview.totalItemCost)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Total cost</dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {formatMoney(preview.totalPurchaseCost)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Landed unit</dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {formatMoney(preview.landedUnitCost)}
          </dd>
        </div>
      </dl>

      <ActionFeedback ok={state.ok} message={state.message} />

      <SubmitButton>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add purchase
      </SubmitButton>
    </form>
  );
}
