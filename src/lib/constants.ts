export const APP_LOCALES = ["en", "cs"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];
