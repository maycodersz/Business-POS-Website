import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Gauge,
  Menu,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Truck,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/products", label: "Products", icon: Package },
  { href: "/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/sales", label: "Sales", icon: ClipboardList },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const mobileNavigationItems = [
  navigationItems[0],
  navigationItems[1],
  navigationItems[4],
] as const;

export const mobileMoreNavigationItems = [
  navigationItems[2],
  navigationItems[3],
  navigationItems[5],
  navigationItems[6],
  navigationItems[7],
  navigationItems[8],
] as const;

export const mobileAddNavigationItem = {
  href: "#add",
  label: "Add",
  icon: Plus,
} as const;

export const mobileMoreNavigationItem = {
  href: "#more",
  label: "More",
  icon: Menu,
} as const;
