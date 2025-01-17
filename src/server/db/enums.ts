export const userVerifiedEnumValues = ["VERIFIED", "UNVERIFIED"] as const;
export const userRoleEnumValues = ["USER", "ADMIN", "SUPERADMIN"] as const;
export const tenantSocialsEnumValues = [
  "instagram",
  "facebook",
  "x",
  "pinterest",
] as const;
export const  reservationStatusEnumValues = ['pending', 'accepted', 'rejected'] as const;
export type UserVerified = (typeof userVerifiedEnumValues)[number];
export type UserRole = (typeof userRoleEnumValues)[number];
export type TenantSocial = (typeof tenantSocialsEnumValues)[number];
