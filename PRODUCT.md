# PRODUCT.md

# ResellOps Product Requirements

## 1. Product Name
 
**ResellOps**

Personal Dropshipping Inventory, Sales, Expenses, and Profit Tracker.

---

## 2. Product Vision

ResellOps helps a small personal dropshipping/reselling operator track the full buy-and-sell cycle from one responsive website.

The product should make it easy to answer:

> “What did I buy, what did I sell, what do I still have, what did I spend, and how much did I earn?”

---

## 3. Target User

The target user is one personal business owner who:

- Buys products online.
- Resells products online.
- Sometimes holds products in inventory if there are no buyers yet.
- Logs sales manually.
- Tracks simple expenses.
- Wants dashboard reports without using complex accounting software.

---

## 4. Product Principles

1. **Simple first** — should feel easier than a spreadsheet.
2. **Inventory accuracy** — every sale must reduce stock.
3. **Batch-based costing** — same product can have different costs.
4. **Profit visibility** — dashboard should clearly show revenue, COGS, expenses, and net profit.
5. **Mobile-friendly** — user should be able to log purchase, sale, or expense from phone.
6. **Personal-use only** — no need for complex team features.

---

## 5. Main Navigation

Desktop sidebar:

```text
Dashboard
Inventory
Products
Purchases
Sales
Expenses
Suppliers
Reports
Settings
```

Mobile bottom navigation:

```text
Dashboard
Inventory
Add
Sales
More
```

Mobile quick add actions:

```text
Add Purchase
Add Sale
Add Expense
Add Supplier
```

---

## 6. User Stories

## 6.1 Dashboard

As the owner, I want to see a dashboard so I can quickly understand if the business is profitable.

Acceptance criteria:

- Shows revenue.
- Shows COGS.
- Shows gross profit.
- Shows expenses.
- Shows net profit.
- Shows inventory value.
- Shows unsold stock count.
- Shows recent purchases.
- Shows recent sales.
- Shows recent expenses.

---

## 6.2 Add Purchase

As the owner, I want to log a product I bought online so the system can add it to inventory.

Final fields:

| Field | Required | Description |
|---|---:|---|
| Product Name | Yes | Name of the product bought |
| Variant | Optional | Color, size, model, flavor, etc. |
| Supplier | Yes | Supplier or seller name |
| Quantity | Yes | Number of items bought |
| Unit Price | Yes | Buy price per item |
| Shipping Fee | Optional | Shipping cost for the purchase |
| Other Fee | Optional | Any other cost related to purchase |
| Purchase Date | Yes | Date product was bought |
| Notes | Optional | Extra details such as negotiated price or demand reason |

Acceptance criteria:

- Can select existing product or create new product.
- Can enter optional variant.
- Can select existing supplier or create supplier.
- Automatically computes total purchase cost.
- Automatically computes landed unit cost.
- Creates a purchase batch.
- Increases inventory.
- Adds inventory movement record.

---

## 6.3 Inventory

As the owner, I want to view all available products so I know what I can still sell.

Acceptance criteria:

- Shows total available quantity per product.
- Shows available quantity by batch.
- Shows supplier for each batch.
- Shows landed unit cost.
- Shows purchase date.
- Shows inventory value.
- Can filter by product name.
- Can filter by supplier.
- Can view product detail.

Important UX rule:

- Do not hide batch differences. The same product with different purchase prices should be visible in the product detail page.

---

## 6.4 Add Sale

As the owner, I want to log a sale so the system can reduce inventory and calculate profit.

Recommended fields:

| Field | Required | Description |
|---|---:|---|
| Sale Date | Yes | Default today |
| Product | Yes | Product sold |
| Variant | Optional | Variant sold |
| Batch | Yes | Inventory batch used |
| Quantity Sold | Yes | Number of units sold |
| Selling Price | Yes | Selling price per unit |
| Platform | Optional | Where the item was sold |
| Customer Name | Optional | Personal reference only |
| Notes | Optional | Extra sale details |

Acceptance criteria:

- Cannot sell unavailable stock.
- Can manually choose batch.
- FIFO can be used as fallback.
- Sale decreases `quantity_available` from the selected batch.
- Sale stores copied `unit_cogs` from the batch.
- Sale calculates revenue.
- Sale calculates COGS.
- Sale calculates gross profit.
- Dashboard updates after sale.

---

## 6.5 Expenses

As the owner, I want to add simple expenses so I can see my true net profit.

Final categories:

```text
shipping
packaging
refund
labour
```

Final fields:

| Field | Required | Description |
|---|---:|---|
| Date | Yes | Automatic today by default |
| Category | Yes | shipping, packaging, refund, labour |
| Amount | Yes | Expense amount |
| Related Sale | Optional | Link expense to a sale |

Acceptance criteria:

- Date defaults to today.
- Category must be one of the four allowed categories.
- Amount must be greater than 0.
- Related sale is optional.
- Expenses reduce net profit.
- Related sale expenses appear in sale detail.

---

## 6.6 Suppliers

As the owner, I want to track suppliers so I can compare prices and contact them again.

Final supplier link rules:

- Only Facebook link.
- Only Messenger link.

Supplier fields:

| Field | Required | Description |
|---|---:|---|
| Supplier Name | Yes | Seller or supplier name |
| Facebook Link | Optional | Facebook profile, page, or post link |
| Messenger Link | Optional | Messenger contact link |
| Notes | Optional | Supplier reliability, pricing notes, reminders |

Acceptance criteria:

- Can add supplier.
- Can edit supplier.
- Can open Facebook link.
- Can open Messenger link.
- Can view supplier purchase history.
- Can see average purchase cost per product from supplier.

---

## 6.7 Reports

As the owner, I want reports so I can review business performance.

Reports required:

1. Profit and Loss Report.
2. Sales Report.
3. Inventory Valuation Report.
4. Expense Report.
5. Product Performance Report.
6. Supplier Price History Report.
7. Dead Stock Report.

Acceptance criteria:

- Reports can be filtered by date range.
- Reports show totals.
- Reports can be viewed on mobile.
- Export is optional for MVP but recommended later.

---

## 7. Page Requirements

## 7.1 Login Page

Purpose:

- Protect personal business data.

Requirements:

- Email and password login.
- No public registration button.
- Redirect authenticated user to dashboard.

---

## 7.2 Dashboard Page

Sections:

1. Summary cards.
2. Revenue/profit chart.
3. Expense breakdown.
4. Inventory value summary.
5. Recent sales.
6. Recent purchases.
7. Recent expenses.
8. Alerts.

Cards:

| Card | Description |
|---|---|
| Total Revenue | Total sales revenue |
| Total COGS | Cost of sold items |
| Gross Profit | Revenue minus COGS |
| Total Expenses | Shipping, packaging, refund, labour |
| Net Profit | Gross profit minus expenses |
| Inventory Value | Value of unsold stock |
| Unsold Stock | Total available stock count |

---

## 7.3 Inventory Page

Features:

- Search product.
- Filter by supplier.
- Filter by stock status.
- View available quantity.
- View inventory value.
- View product detail.

Inventory row actions:

- View.
- Add sale.
- Add purchase.
- Adjust stock.

---

## 7.4 Product Detail Page

Sections:

- Product summary.
- Variant list.
- Current stock.
- Purchase batches.
- Sales history.
- Related expenses through sales.
- Supplier price history.
- Profit summary.

Important display:

```text
Product: Wireless Mouse
Total Available: 5
Total Inventory Value: 650
Average Landed Cost: 130
```

Batch table:

| Purchase Date | Supplier | Variant | Qty Bought | Qty Available | Unit Price | Landed Cost |
|---|---|---|---:|---:|---:|---:|

---

## 7.5 Purchases Page

Features:

- Add purchase.
- View purchases.
- Search by product.
- Filter by supplier.
- Filter by date.

Purchase table:

| Date | Product | Variant | Supplier | Qty | Unit Price | Shipping | Other Fee | Landed Cost |
|---|---|---|---|---:|---:|---:|---:|---:|

---

## 7.6 Sales Page

Features:

- Add sale.
- View sales.
- Search by product.
- Filter by date.
- View sale detail.

Sales table:

| Date | Product | Qty | Revenue | COGS | Gross Profit | Expenses | Net Profit |
|---|---|---:|---:|---:|---:|---:|---:|

---

## 7.7 Sale Detail Page

Sections:

- Sale summary.
- Items sold.
- Batch used.
- Revenue.
- COGS.
- Gross profit.
- Related expenses.
- Net profit.

Related expenses table:

| Date | Category | Amount |
|---|---|---:|

---

## 7.8 Expenses Page

Features:

- Add expense.
- Filter by category.
- Filter by date.
- Filter by related sale.

Expense table:

| Date | Category | Amount | Related Sale |
|---|---|---:|---|

---

## 7.9 Suppliers Page

Features:

- Add supplier.
- Edit supplier.
- Open Facebook link.
- Open Messenger link.
- View purchase history.

Supplier table:

| Supplier | Facebook | Messenger | Total Purchases | Total Qty | Average Cost |
|---|---|---|---:|---:|---:|

---

## 8. Status Rules

## 8.1 Product Status

```text
active
archived
```

## 8.2 Inventory Batch Status

This can be calculated instead of stored.

```text
available: quantity_available > 0
sold_out: quantity_available = 0
```

## 8.3 Stock Alert Status

```text
in_stock: quantity_available > low_stock_threshold
low_stock: quantity_available > 0 and <= low_stock_threshold
out_of_stock: quantity_available = 0
dead_stock: quantity_available > 0 and no sale after configured days
```

---

## 9. Mobile UX Requirements

The app must be easy to use on phone.

Mobile behavior:

- Tables become cards.
- Forms use full-screen sheets or pages.
- Main actions are large buttons.
- Dashboard cards stack vertically.
- Charts are scrollable or simplified.
- Bottom navigation is used instead of sidebar.

Mobile card example:

```text
Wireless Mouse - Black
Available: 3
Supplier: Facebook Seller A
Landed Cost: 130
[Add Sale] [View]
```

---

## 10. Empty States

The system should guide the user when there is no data.

Examples:

### No inventory

```text
No inventory yet.
Add your first purchase to start tracking stock and profit.
```

### No sales

```text
No sales logged yet.
When you sell a product, add a sale here to update your dashboard.
```

### No expenses

```text
No expenses yet.
Add shipping, packaging, refund, or labour expenses to track net profit.
```

---

## 11. Final MVP Definition

The MVP should allow this complete workflow:

```text
Login
→ Add Supplier
→ Add Purchase
→ Inventory Batch Created
→ View Inventory
→ Add Sale
→ Inventory Decreases
→ Add Related Expense
→ Dashboard Updates
→ View Report
```

Once this flow works cleanly, the product is already useful.
