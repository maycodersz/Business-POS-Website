import type { LucideIcon } from "lucide-react";

import { MetricCard } from "@/components/ui/responsive-primitives";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return <MetricCard helper={helper} icon={Icon} label={label} value={value} />;
}
