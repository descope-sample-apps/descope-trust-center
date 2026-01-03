import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const cookieLocale = cookies().get("locale")?.value;
  const resolvedLocale = cookieLocale || locale || "en";

  return {
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
