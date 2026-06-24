import {
  LayoutDashboard,
  Archive,
  Shapes,
  Users,
  Handshake,
  ShoppingCart,
  ScrollText,
  Banknote,
  Warehouse,
  ChartColumn,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "../api/auth";

export type NavLinkItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
};

export const navLinks: NavLinkItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Products",
    to: "/products",
    icon: Archive,
    allowedRoles: ["ADMIN", "MANAGER", "CASHIER", "INVENTORY_STAFF"],
  },
  {
    label: "Categories",
    to: "/categories",
    icon: Shapes,
    allowedRoles: ["ADMIN", "MANAGER", "CASHIER", "INVENTORY_STAFF"],
  },
  {
    label: "Customers",
    to: "/customers",
    icon: Users,
    allowedRoles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    label: "Suppliers",
    to: "/suppliers",
    icon: Handshake,
    allowedRoles: ["ADMIN", "MANAGER", "INVENTORY_STAFF"],
  },
  {
    label: "Purchases",
    to: "/purchases",
    icon: ShoppingCart,
    allowedRoles: ["ADMIN", "MANAGER", "INVENTORY_STAFF"],
  },
  {
    label: "Orders",
    to: "/orders",
    icon: ScrollText,
    allowedRoles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    label: "Expenses",
    to: "/expenses",
    icon: Banknote,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Stock",
    to: "/stock-movements",
    icon: Warehouse,
    allowedRoles: ["ADMIN", "MANAGER", "INVENTORY_STAFF"],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: ChartColumn,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Users",
    to: "/users",
    icon: UserRoundCog,
    allowedRoles: ["ADMIN"],
  },
];
