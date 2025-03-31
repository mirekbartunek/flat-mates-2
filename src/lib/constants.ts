import type { UserRole } from "@/server/db/enums";

export const APP_LOCALES = ["en", "cs"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const ALLOWED_IMAGE_FORMATS = ["image/jpeg", "image/jpg", "image/png"];

export const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

export const RIGHT_TO_CHANGE_ROLES: Record<UserRole, string[]> = {
  ADMIN: ["USER", "ADMIN"],
  SUPERADMIN: ["USER", "ADMIN", "SUPERADMIN"],
  USER: [],
} as const;

export const CAN_MODIFY_ROLE: Record<UserRole, UserRole[]> = {
  ADMIN: ["USER", "ADMIN"],
  SUPERADMIN: ["USER", "ADMIN", "SUPERADMIN"],
  USER: [],
};

export const RIGHT_TO_VERIFY_USERS: Record<UserRole, boolean> = {
  ADMIN: true,
  SUPERADMIN: true,
  USER: false,
};

export const MAX_FILE_COUNT = 10;

export const fileValidator = {
  maxFileSize: "4MB",
  maxFileCount: 10,
  accepted: ["image/jpeg", "image/png", "image/webp"],
};
