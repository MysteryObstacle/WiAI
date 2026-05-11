import { getRequestConfig } from "next-intl/server";

export type Locale = "zh-CN" | "en-US";

export const locales: Locale[] = ["zh-CN", "en-US"];
export const defaultLocale: Locale = "zh-CN";

export default getRequestConfig(async () => {
  // For now, we use a cookie-based locale detection
  // This will be enhanced later with proper routing
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
