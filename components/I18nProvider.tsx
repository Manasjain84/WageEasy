"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import i18next from "i18next";
import { I18nextProvider, initReactI18next, useTranslation as useI18nextTranslation } from "react-i18next";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

export type Locale = "en" | "hi";
const i18n = i18next.createInstance();
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void } | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem("wageeasy-locale") as Locale | null;
    const detected = navigator.language.toLowerCase().startsWith("hi") ? "hi" : "en";
    const initial = saved === "hi" || saved === "en" ? saved : detected;
    setLocaleState(initial);
    void i18n.changeLanguage(initial);
    document.documentElement.lang = initial;
  }, []);
  const setLocale = (next: Locale) => {
    setLocaleState(next);
    void i18n.changeLanguage(next);
    window.localStorage.setItem("wageeasy-locale", next);
    document.documentElement.lang = next;
  };
  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useTranslation must be used inside I18nProvider");
  const { t } = useI18nextTranslation();
  return { ...context, t };
}
