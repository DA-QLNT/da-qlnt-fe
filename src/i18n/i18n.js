import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LOGIN_EN from "../locales/en/login.json";
import LOGIN_VI from "../locales/vi/login.json";

export const locales = {
  en: "English",
  vi: "Tiếng Việt",
};

const resources = {
  en: {
    login: LOGIN_EN,
  },
  vi: {
    login: LOGIN_VI,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  ns:["login", "sidebar"],
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
