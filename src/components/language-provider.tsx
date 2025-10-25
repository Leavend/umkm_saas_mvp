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
  isSupportedLocale,
  type Locale,
} from "~/lib/i18n";
import { addLocalePrefixToPath } from "~/lib/routing";

interface LanguageContextValue {
  lang: Locale;
  setLocale: (lang: Locale) => void;
  translations: (typeof TRANSLATIONS)[Locale];
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
  const [lang, setLocaleState] = useState<Locale>(initialLocale);
  const [hasHydrated, setHasHydrated] = useState(false);

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
      const oneYearInSeconds = 60 * 60 * 24 * 365;
      document.cookie = `${LANGUAGE_STORAGE_KEY}=${value}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax`;
      document.documentElement.setAttribute("lang", value);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    persistLocalePreferences(lang);
  }, [lang, hasHydrated, persistLocalePreferences]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasHydrated(true);
      return;
    }

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) {
      // ✅ Hapus 'as Locale' karena type guard sudah menjamin stored adalah Locale
      setLocaleState((current) => (current === stored ? current : stored));
    } else if (stored && !isSupportedLocale(stored)) {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) {
        return;
      }

      const next = event.newValue;
      if (!next) {
        return;
      }

      if (!isSupportedLocale(next)) {
        return;
      }

      const nextLocale = next;
      // now nextLocale is narrowed to Locale by the type guard
      setLocaleState((current) =>
        current === nextLocale ? current : nextLocale,
      );
    };

    window.addEventListener("storage", handleStorageChange);
    setHasHydrated(true);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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

export function useTranslations() {
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
