// src/components/language-provider.tsx

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
  normalizeLocale,
} from "~/lib/i18n";
import { addLocalePrefixToPath } from "~/lib/routing";

interface LanguageContextValue {
  lang: Locale;
  setLocale: (lang: Locale) => void;
  translations: (typeof TRANSLATIONS)[Locale];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_MAX_AGE = 60 * 60 * 24 * 365;

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale: Locale;
}

export function LanguageProvider({
  children,
  initialLocale,
}: LanguageProviderProps) {
  const [lang, setLocaleState] = useState<Locale>(initialLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLocaleState((current) =>
      current === initialLocale ? current : initialLocale,
    );
  }, [initialLocale]);

  const persistLocalePreferences = useCallback((value: Locale) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    }

    if (typeof document !== "undefined") {
      document.cookie = `${LANGUAGE_STORAGE_KEY}=${value}; path=/; max-age=${STORAGE_MAX_AGE}; SameSite=Lax`;
      document.documentElement.setAttribute("lang", value);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsHydrated(true);
      return;
    }

    const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedValue) {
      const resolved = normalizeLocale(storedValue, initialLocale);
      if (resolved !== storedValue) {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
      }
      setLocaleState((current) => (current === resolved ? current : resolved));
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY || !event.newValue) {
        return;
      }

      const nextLocale = normalizeLocale(event.newValue, initialLocale);

      setLocaleState((current) =>
        current === nextLocale ? current : nextLocale,
      );
    };

    window.addEventListener("storage", handleStorageChange);
    setIsHydrated(true);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initialLocale]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    persistLocalePreferences(lang);
  }, [lang, isHydrated, persistLocalePreferences]);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) {
      return;
    }

    setLocaleState((current) =>
      current === nextLocale ? current : nextLocale,
    );
  }, []);

  const translations = useMemo(() => TRANSLATIONS[lang], [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLocale,
      translations,
    }),
    [lang, setLocale, translations],
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

export function useTranslations(): (typeof TRANSLATIONS)[Locale] {
  const { translations } = useLanguage();
  return translations;
}

export function useLocalePath() {
  const { lang } = useLanguage();

  return useCallback(
    (path: string) => addLocalePrefixToPath(path, lang),
    [lang],
  );
}
