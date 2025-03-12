import type { UserRole } from "@/server/db/enums";
export const APP_LOCALES = ["en", "cs"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];
export const ALLOWED_IMAGE_FORMATS = ["image/jpeg", "image/jpg", "image/png"];
export const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];
export const RIGHT_TO_CHANGE_ROLES: Record<UserRole, string[]> = {
  // ADMIN : CAN CHANGE TO USER, ADMIN etc..
  ADMIN: ["USER", "ADMIN"],
  SUPERADMIN: ["USER", "ADMIN", "SUPERADMIN"],
  USER: [],
} as const;

export const RIGHT_TO_VERIFY_USERS: Record<UserRole, boolean> = {
  ADMIN: true,
  SUPERADMIN: true,
  USER: false,
};
