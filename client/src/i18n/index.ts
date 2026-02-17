import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.ts';

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': ptBR,
  },
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;

