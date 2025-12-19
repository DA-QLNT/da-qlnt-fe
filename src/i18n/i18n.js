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
import PERMISSIONCONTENT_EN from "../locales/en/permissioncontent.json";
import PERMISSIONCONTENT_VI from "../locales/vi/permissioncontent.json";
import HOUSE_EN from "../locales/en/house.json";
import HOUSE_VI from "../locales/vi/house.json";
import SERVICE_EN from "../locales/en/service.json";
import SERVICE_VI from "../locales/vi/service.json";
import REPAIRREPORTRULE_EN from "../locales/en/repair&report&rule.json";
import REPAIRREPORTRULE_VI from "../locales/vi/repair&report&rule.json";
import CONTRACTINVOICE_EN from "../locales/en/contract&invoice.json";
import CONTRACTINVOICE_VI from "../locales/vi/contract&invoice.json";
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
    permissioncontent: PERMISSIONCONTENT_EN,
    house: HOUSE_EN,
    service: SERVICE_EN,
    repairreportrule: REPAIRREPORTRULE_EN,
    contractinvoice: CONTRACTINVOICE_EN,
  },
  vi: {
    login: LOGIN_VI,
    sidebar: SIDEBAR_VI,
    usercontent: USERCONTENT_VI,
    rolecontent: ROLECONTENT_VI,
    permissioncontent: PERMISSIONCONTENT_VI,
    house: HOUSE_VI,
    service: SERVICE_VI,
    repairreportrule: REPAIRREPORTRULE_VI,
    contractinvoice: CONTRACTINVOICE_VI,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    // lng: "vi",
    ns: [
      "login",
      "sidebar",
      "usercontent",
      "rolecontent",
      "permissioncontent",
      "house",
      "service",
      "repairreportrule",
      "contractinvoice",
    ],
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
