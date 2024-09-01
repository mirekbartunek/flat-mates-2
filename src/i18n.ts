import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { APP_LOCALES, type AppLocale } from "@/lib/constants";

export default getRequestConfig(async () => {
  const heads = headers();
  let resolvedLocale: AppLocale = APP_LOCALES[0];
  const localeHeader = heads.get("accept-language");
  if (localeHeader) {
    const split = localeHeader.split(",");
    const locale = split.at(0)!;
    const prefix = locale.split("-").at(0) as AppLocale;
    if (prefix && APP_LOCALES.includes(prefix)) {
      resolvedLocale = prefix;
    }
  }
  console.log(`>>> LOCALE: ${resolvedLocale}`);
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
    locale: resolvedLocale, // check if works
  };
});
