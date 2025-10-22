import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import LOGIN_EN from "../locales/en/login.json";
import LOGIN_VI from "../locales/vi/login.json";
import SIDEBAR_EN from "../locales/en/sidebar.json";
import SIDEBAR_VI from "../locales/vi/sidebar.json";
import USERCONTENT_EN from "../locales/en/usercontent.json";
import USERCONTENT_VI from "../locales/vi/usercontent.json";
import ROLECONTENT_EN from "../locales/en/rolecontent.json";
import ROLECONTENT_VI from "../locales/vi/rolecontent.json";

// import { locales } from "@/i18n/i18n";
export const locales = {
  en: "English",
  vi: "Tiếng Việt",
};

const resources = {
  en: {
    login: LOGIN_EN,
    sidebar: SIDEBAR_EN,
    usercontent: USERCONTENT_EN,
    rolecontent: ROLECONTENT_EN,
  },
  vi: {
    login: LOGIN_VI,
    sidebar: SIDEBAR_VI,
    usercontent: USERCONTENT_VI,
    rolecontent: ROLECONTENT_VI,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    // lng: "en",
    ns: ["login", "sidebar", "usercontent", "rolecontent"],
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
