export const userVerifiedEnumValues = ["VERIFIED", "UNVERIFIED"] as const;
export const userRoleEnumValues = ["USER", "ADMIN", "SUPERADMIN"] as const;
export const tenantSocials = [
  "instagram",
  "facebook",
  "x",
  "pinterest",
] as const;
export type UserVerified = (typeof userVerifiedEnumValues)[number];
export type UserRole = (typeof userRoleEnumValues)[number];
