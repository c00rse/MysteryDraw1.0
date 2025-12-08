import { getLocale } from "astro-i18n-aut";
import { translations } from "../data/translations";
import type { Locale, TranslationKeys } from "../data/translations"; 

export function t(key: TranslationKeys, url: URL) {
  const locale = getLocale(url) as Locale; // rzutujemy na typ Locale
  const localeTranslations = translations[locale] || translations.en;
  return localeTranslations[key] || key;
}
