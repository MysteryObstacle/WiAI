"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { IntlProvider } from "next-intl";
import type { Locale } from "@/i18n";

const LOCALE_STORAGE_KEY = "wiai:locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

type LocaleProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
  messages: Record<Locale, Record<string, unknown>>;
};

export function LocaleProvider({ children, initialLocale = "zh-CN", messages }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (savedLocale && (savedLocale === "zh-CN" || savedLocale === "en-US")) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages[locale] as Record<string, string>} timeZone="Asia/Shanghai">
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}
