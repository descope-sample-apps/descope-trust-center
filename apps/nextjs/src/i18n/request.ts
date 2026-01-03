import { getRequestConfig } from "next-intl/server";

import de from "../messages/de.json";
import en from "../messages/en.json";
import es from "../messages/es.json";
import fr from "../messages/fr.json";
import ja from "../messages/ja.json";

const messages = { en, de, es, fr, ja };

export default getRequestConfig(({ locale }) => {
  const resolvedLocale = locale ?? "en";
  return {
    locale: resolvedLocale,
    messages: messages[resolvedLocale as keyof typeof messages],
  };
});
