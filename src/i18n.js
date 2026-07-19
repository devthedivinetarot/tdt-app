import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import hinglish from './locales/hinglish.json';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'hinglish', label: 'Hinglish' },
];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    hinglish: { translation: hinglish },
  },
  lng: 'hinglish',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
