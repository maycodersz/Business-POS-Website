import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

type PagePlaceholderProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: LucideIcon;
};

export function PagePlaceholder({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      <EmptyState
        icon={icon}
        title={emptyTitle}
        description={emptyDescription}
      />
    </div>
  );
}
