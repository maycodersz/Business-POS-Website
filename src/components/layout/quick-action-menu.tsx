import { FloatingAddItemButton } from "@/components/layout/add-item-button";

export function QuickActionMenu() {
  return (
    <div className="hidden md:block xl:hidden">
      <FloatingAddItemButton />
    </div>
  );
}
