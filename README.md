# ResellOps

Personal dropshipping inventory, sales, expenses, and profit tracker.

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and add your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

Start or reset the local Supabase database:

```bash
npx supabase db start
npx supabase db reset --local --no-seed
```

## Phase Status

Phase 0 is complete:

- Next.js, React, TypeScript, Tailwind CSS
- Supabase SSR client setup
- Login page with email/password sign-in
- Protected app routes
- Dashboard shell
- Desktop sidebar and mobile bottom navigation
- Reusable UI components

Phase 1 is complete locally:

- Supabase project config
- Initial database migration
- Products, variants, suppliers, purchase batches, sales, sale items, expenses, inventory movements
- Generated purchase and sale calculation columns
- Constraints, relationships, foreign key indexes, and date indexes
- Owner-based Row Level Security policies
- Generated TypeScript database types

Phase 2 is complete in the app:

- Supplier create/edit/list UI
- Supplier Facebook and Messenger links
- Supplier notes
- Product create/edit/archive/list UI
- Product search by name
- Product variant creation
- Zod validation for supplier, product, and variant forms

Phase 3 is complete in the app:

- Purchase validation and landed-cost preview
- Add purchase form using existing products, variants, and suppliers
- Add purchase form can create a new product, variant, or supplier inline
- Purchase batch creation with matching inventory movement
- Purchases page listing purchase batches
- Inventory page showing batch-level available quantity and value
- Product detail page with variants, inventory summary, and batch history

Phase 4 is complete in the app:

- Sale validation and revenue/COGS/gross-profit preview
- Transactional `create_sale_from_batch` database RPC
- Add sale form using available inventory batches
- Inventory batch link to add sale
- Sales history page
- Sale detail page showing batch, unit COGS, revenue, COGS, and gross profit

Phase 5 is complete in the app:

- Expense validation for shipping, packaging, refund, and labour
- Add expense form with date defaulting to today
- Optional related sale selector
- Expenses history page
- Sale detail related expenses and net profit
- Dashboard totals for revenue, COGS, expenses, net profit, inventory value, and unsold stock

Phase 6 is complete in the app:

- Dashboard range filter for 7 days, 30 days, 90 days, and all time
- Summary cards for revenue, COGS, gross profit, expenses, net profit, inventory value, inventory cash spent, unsold quantity, low stock, and dead stock
- Revenue, expense, and net-profit chart
- Expense category chart and category totals
- Recent purchases, sales, and expenses
- Inventory alerts for low-stock and dead-stock batches

Phase 7 is complete in the app:

- Reports range filter for 7 days, 30 days, 90 days, and all time
- Profit and loss report
- Sales report
- Inventory valuation report
- Expense report
- Product performance report
- Supplier price history report
- Dead stock report

Phase 8 is complete in the app:

- Existing desktop sidebar and mobile bottom navigation verified
- Mobile floating quick-action menu for purchases, sales, and expenses
- Header quick action links to add purchase
- Route-level loading skeletons for authenticated pages
- Mobile card views for reports with desktop tables preserved
- Confirmation prompt for product archive
- Shared action feedback for form success and error messages
- Larger touch targets and improved form spacing on mobile

Phase 9 is complete in the app:

- Inventory adjustment validation blocks zero, negative-final, and over-purchased stock changes
- Transactional `adjust_inventory_batch` database RPC
- Manual stock adjustment form on inventory batches
- Manual adjustments create `manual_adjustment` inventory movement audit rows
- Inventory page shows recent purchase, sale, and manual adjustment movements
- Product archive uses confirmation instead of immediate action
