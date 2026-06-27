"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DashboardSeriesPoint,
  ExpenseCategoryPoint,
} from "@/features/dashboard/summary";

type DashboardChartsProps = {
  dailySeries: DashboardSeriesPoint[];
  expenseCategories: ExpenseCategoryPoint[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-md bg-slate-50 px-4 text-center text-sm text-slate-500">
      No {label} data in this range.
    </div>
  );
}

export function DashboardCharts({
  dailySeries,
  expenseCategories,
}: DashboardChartsProps) {
  const categoryData = expenseCategories.map((expense) => ({
    ...expense,
    label: formatCategory(expense.category),
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Revenue, expenses, and profit
          </h2>
        </div>
        <div className="mt-4 sm:mt-5">
          {dailySeries.length === 0 ? (
            <EmptyChart label="revenue" />
          ) : (
          <div className="h-56 min-w-0 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries} margin={{ bottom: 0, left: -18, right: 4, top: 8 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                fontSize={12}
                interval="preserveStartEnd"
                minTickGap={18}
                stroke="#64748b"
                tickLine={false}
              />
              <YAxis
                fontSize={12}
                hide
                stroke="#64748b"
                tickFormatter={formatMoney}
                tickLine={false}
              />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Area
                animationDuration={450}
                dataKey="revenue"
                fill="#dbeafe"
                name="Revenue"
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Area
                animationDuration={450}
                dataKey="expenses"
                fill="#fee2e2"
                name="Expenses"
                stroke="#dc2626"
                strokeWidth={2}
              />
              <Area
                animationDuration={450}
                dataKey="netProfit"
                fill="#dcfce7"
                name="Net profit"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-950">
          Expense categories
        </h2>
        <div className="mt-4 sm:mt-5">
          {categoryData.length === 0 ? (
            <EmptyChart label="expense category" />
          ) : (
          <div className="h-56 min-w-0 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ bottom: 0, left: -18, right: 4, top: 8 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                fontSize={12}
                interval={0}
                stroke="#64748b"
                tickLine={false}
              />
              <YAxis
                fontSize={12}
                hide
                stroke="#64748b"
                tickFormatter={formatMoney}
                tickLine={false}
              />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Bar
                animationDuration={450}
                dataKey="amount"
                fill="#0f766e"
                name="Amount"
                radius={4}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
