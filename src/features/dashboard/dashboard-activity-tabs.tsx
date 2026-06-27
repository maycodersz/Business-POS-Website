"use client";

import Link from "next/link";
import { Boxes, ClipboardList, CreditCard } from "lucide-react";
import { useState } from "react";

import { MobileRecordCard, SectionCard } from "@/components/ui/responsive-primitives";
import { cn } from "@/lib/utils/cn";

type ActivityItem = {
  amount: string;
  href?: string;
  id: string;
  meta: string;
  title: string;
};

type DashboardActivityTabsProps = {
  expenses: ActivityItem[];
  purchases: ActivityItem[];
  sales: ActivityItem[];
};

const tabs = [
  { key: "sales", label: "Sales", icon: ClipboardList },
  { key: "purchases", label: "Purchases", icon: Boxes },
  { key: "expenses", label: "Expenses", icon: CreditCard },
] as const;

export function DashboardActivityTabs({
  expenses,
  purchases,
  sales,
}: DashboardActivityTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("sales");
  const activity = {
    expenses,
    purchases,
    sales,
  }[activeTab];

  return (
    <SectionCard className="lg:hidden" title="Recent activity">
      <div className="grid grid-cols-3 rounded-md bg-slate-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;

          return (
            <button
              className={cn(
                "flex h-10 touch-manipulation items-center justify-center gap-1 rounded px-2 text-xs font-medium transition active:scale-[0.98]",
                active
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 active:bg-slate-200",
              )}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {activity.length === 0 ? (
          <p className="text-sm text-slate-500">No {activeTab} in range.</p>
        ) : (
          activity.map((item) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-950">
                    {item.amount}
                  </p>
                </div>
              </>
            );

            return item.href ? (
              <Link href={item.href} key={item.id}>
                <MobileRecordCard>{content}</MobileRecordCard>
              </Link>
            ) : (
              <MobileRecordCard key={item.id}>{content}</MobileRecordCard>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}

