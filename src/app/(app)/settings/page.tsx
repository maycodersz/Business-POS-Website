import { Settings } from "lucide-react";

import { PagePlaceholder } from "@/components/ui/page-placeholder";
import { AddModal } from "@/features/add-modal/add-modal";

type SettingsPageProps = {
  searchParams: Promise<{
    add?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { add } = await searchParams;

  return (
    <>
      <PagePlaceholder
        icon={Settings}
        title="Settings"
        description="Settings will hold personal app preferences such as stock thresholds after the MVP workflow is stable."
        emptyTitle="No settings yet"
        emptyDescription="The MVP starts with authentication, schema, records, and the core tracking workflow."
      />
      <AddModal add={add} defaultKind="purchase" />
    </>
  );
}
