"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import zhCN from "@/messages/zh-CN.json";
import enUS from "@/messages/en-US.json";

const messages = {
  "zh-CN": zhCN,
  "en-US": enUS
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider messages={messages} initialLocale="zh-CN">
      {children}
    </LocaleProvider>
  );
}
