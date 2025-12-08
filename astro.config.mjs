/* Config skopiowany ze strony npm dla astro-i18n-aut */
import { defineConfig } from "astro/config";
import { i18n, filterSitemapByDefaultLocale } from "astro-i18n-aut/integration";
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";

const defaultLocale = "en";
const locales = {
  en: "en", // the `defaultLocale` value must present in `locales` keys
  pl: "pl",
};

export default defineConfig({
  site: "http://localhost:4321/",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [
    i18n({
      locales,
      defaultLocale,
    }),
    sitemap({
      i18n: {
        locales,
        defaultLocale,
      },
      filter: filterSitemapByDefaultLocale({ defaultLocale }),
    }),
    react(),
  ],
});