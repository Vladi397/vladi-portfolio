import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // load translation using http -> see /public/locales
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV, // chatty in the console, and only useful here

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

/*
  Keep <html lang> in step with the chosen language. Nothing was updating it,
  so the Dutch and Bulgarian pages still announced themselves as English —
  which is the attribute a screen reader uses to choose its pronunciation, and
  the one search engines index the page's language by.
*/
const syncHtmlLang = (lng) => {
  const code = (lng || '').split('-')[0];
  if (code && typeof document !== 'undefined') document.documentElement.lang = code;
};
i18n.on('languageChanged', syncHtmlLang);
i18n.on('initialized', () => syncHtmlLang(i18n.resolvedLanguage || i18n.language));

export default i18n;