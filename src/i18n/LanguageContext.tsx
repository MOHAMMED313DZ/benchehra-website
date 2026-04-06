import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Lang } from "./translations";

type Translations = (typeof translations)[Lang];

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang") as Lang;
    return saved === "en" ? "en" : "ar";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
