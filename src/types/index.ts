export * from "@/api/types";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  adminOnly?: boolean;
}

export type SportFilter = "Toate" | "Fotbal" | "Tenis" | "Înot";
