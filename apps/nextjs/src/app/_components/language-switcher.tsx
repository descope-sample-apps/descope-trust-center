"use client";

import { useLocale } from "next-intl";

import { usePathname, useRouter } from "~/i18n/routing";

const LANGUAGES = [
  { code: "en", name: "EN" },
  { code: "de", name: "DE" },
  { code: "es", name: "ES" },
  { code: "fr", name: "FR" },
  { code: "ja", name: "JA" },
] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <div className="flex gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code)}
          className={`rounded px-2 py-1 text-sm ${
            currentLocale === lang.code
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
