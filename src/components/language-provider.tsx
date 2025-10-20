"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  TRANSLATIONS,
  type Locale,
  type Translations,
} from "~/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale: Locale;
}

export function LanguageProvider({
  children,
  initialLocale,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState((current) => (current === initialLocale ? current : initialLocale));
  }, [initialLocale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
    }
  }, []);

  const persistLocalePreferences = useCallback((value: Locale) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    }

    if (typeof document !== "undefined") {
      const oneYearInSeconds = 60 * 60 * 24 * 365;
      document.cookie = `${LANGUAGE_STORAGE_KEY}=${value}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax`;
      document.documentElement.setAttribute("lang", value);
    }
  }, []);

  useEffect(() => {
    persistLocalePreferences(locale);
  }, [locale, persistLocalePreferences]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
    },
    [],
  );

  const translations = useMemo(() => TRANSLATIONS[locale], [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      translations,
    }),
    [locale, setLocale, translations],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}

export function useTranslations() {
  const { translations } = useLanguage();
  return translations;
}
