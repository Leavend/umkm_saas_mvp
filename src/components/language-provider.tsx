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
  isSupportedLocale,
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
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setLocaleState((current) => (current === initialLocale ? current : initialLocale));
  }, [initialLocale]);

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
    if (!hasHydrated) {
      return;
    }

    persistLocalePreferences(locale);
  }, [locale, hasHydrated, persistLocalePreferences]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasHydrated(true);
      return;
    }

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) {
      setLocaleState((current) =>
        current === stored ? current : (stored as Locale),
      );
    } else if (stored && !isSupportedLocale(stored)) {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY || !event.newValue) {
        return;
      }

      if (!isSupportedLocale(event.newValue)) {
        return;
      }

      setLocaleState((current) =>
        current === event.newValue ? current : (event.newValue as Locale),
      );
    };

    window.addEventListener("storage", handleStorageChange);
    setHasHydrated(true);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (!SUPPORTED_LOCALES.includes(nextLocale)) {
        return;
      }

      setLocaleState((current) => (current === nextLocale ? current : nextLocale));
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
