"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import type { Locale } from "@/i18n";
import { useTranslations } from "next-intl";

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations("nav");

  const toggleLocale = () => {
    const newLocale: Locale = locale === "zh-CN" ? "en-US" : "zh-CN";
    setLocale(newLocale);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      aria-label={t("languageSwitch")}
    >
      <Languages className="h-4 w-4" aria-hidden />
      <span>{locale === "zh-CN" ? "EN" : "中"}</span>
    </Button>
  );
}
