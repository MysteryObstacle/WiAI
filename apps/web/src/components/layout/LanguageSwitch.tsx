"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import type { Locale } from "@/i18n";

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    const newLocale: Locale = locale === "zh-CN" ? "en-US" : "zh-CN";
    setLocale(newLocale);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      aria-label={locale === "zh-CN" ? "Switch to English" : "切换到中文"}
    >
      <Languages className="h-4 w-4" aria-hidden />
      <span>{locale === "zh-CN" ? "EN" : "中"}</span>
    </Button>
  );
}
