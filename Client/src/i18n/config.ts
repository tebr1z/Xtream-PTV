import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import trTranslations from './locales/tr.json';
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';
import azTranslations from './locales/az.json';

try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        tr: { translation: trTranslations },
        en: { translation: enTranslations },
        ru: { translation: ruTranslations },
        az: { translation: azTranslations },
      },
      fallbackLng: 'tr',
      defaultNS: 'translation',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false,
      },
    });
} catch (error) {
  console.error('i18n initialization error:', error);
  // Fallback initialization
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        tr: { translation: trTranslations },
        en: { translation: enTranslations },
        ru: { translation: ruTranslations },
        az: { translation: azTranslations },
      },
      fallbackLng: 'tr',
      lng: 'tr',
      defaultNS: 'translation',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
