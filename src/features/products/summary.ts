type ProductInventoryBatch = {
  quantity: number;
  quantity_available: number;
  landed_unit_cost: number | null;
  total_purchase_cost: number | null;
};

export function summarizeProductInventory(batches: ProductInventoryBatch[]) {
  const totalPurchasedQuantity = batches.reduce(
    (sum, batch) => sum + batch.quantity,
    0,
  );
  const totalAvailableQuantity = batches.reduce(
    (sum, batch) => sum + batch.quantity_available,
    0,
  );
  const inventoryValue = batches.reduce(
    (sum, batch) =>
      sum + batch.quantity_available * (batch.landed_unit_cost ?? 0),
    0,
  );
  const inventoryCashSpent = batches.reduce(
    (sum, batch) => sum + (batch.total_purchase_cost ?? 0),
    0,
  );

  return {
    batchCount: batches.length,
    activeBatchCount: batches.filter((batch) => batch.quantity_available > 0)
      .length,
    totalPurchasedQuantity,
    totalAvailableQuantity,
    inventoryValue,
    inventoryCashSpent,
    averageLandedCost:
      totalAvailableQuantity > 0 ? inventoryValue / totalAvailableQuantity : 0,
  };
}
