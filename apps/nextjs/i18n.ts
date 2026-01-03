import { getRequestConfig } from "next-intl/server";

import de from "./src/messages/de.json";
import en from "./src/messages/en.json";
import es from "./src/messages/es.json";
import fr from "./src/messages/fr.json";
import ja from "./src/messages/ja.json";

const messages = { en, de, es, fr, ja };

export default getRequestConfig(({ locale }) => {
  const resolvedLocale = locale ?? "en";
  return {
    locale: resolvedLocale,
    messages: messages[resolvedLocale as keyof typeof messages],
  };
});
