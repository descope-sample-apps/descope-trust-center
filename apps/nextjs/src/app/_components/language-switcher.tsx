"use client";

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

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <div className="flex gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code)}
          className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-sm"
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
