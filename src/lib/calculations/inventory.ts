export function calculateTotalItemCost(quantity: number, unitPrice: number) {
  return quantity * unitPrice;
}

export function calculateTotalPurchaseCost(
  quantity: number,
  unitPrice: number,
  shippingFee = 0,
  otherFee = 0,
) {
  return calculateTotalItemCost(quantity, unitPrice) + shippingFee + otherFee;
}

export function calculateLandedUnitCost(
  quantity: number,
  unitPrice: number,
  shippingFee = 0,
  otherFee = 0,
) {
  if (quantity <= 0) {
    return 0;
  }

  return calculateTotalPurchaseCost(quantity, unitPrice, shippingFee, otherFee) / quantity;
}

export function calculateSaleRevenue(quantitySold: number, sellingPrice: number) {
  return quantitySold * sellingPrice;
}

export function calculateCOGS(quantitySold: number, unitCogs: number) {
  return quantitySold * unitCogs;
}

export function calculateGrossProfit(revenue: number, cogs: number) {
  return revenue - cogs;
}

export function calculateNetProfit(grossProfit: number, expenses: number) {
  return grossProfit - expenses;
}
