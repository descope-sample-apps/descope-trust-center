import { createNavigation } from "next-intl/navigation";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: ["en", "de", "es", "fr", "ja"],
  defaultLocale: "en",
  localePrefix: "always",
});
