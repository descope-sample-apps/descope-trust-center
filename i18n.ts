import { getRequestConfig } from "next-intl/server";

import de from "./apps/nextjs/src/messages/de.json";
import en from "./apps/nextjs/src/messages/en.json";
import es from "./apps/nextjs/src/messages/es.json";
import fr from "./apps/nextjs/src/messages/fr.json";
import ja from "./apps/nextjs/src/messages/ja.json";

const messages = { en, de, es, fr, ja };

export default getRequestConfig(({ locale }) => {
  const resolvedLocale = locale || "en";
  return {
    locale: resolvedLocale,
    messages: messages[resolvedLocale as keyof typeof messages],
  };
});
