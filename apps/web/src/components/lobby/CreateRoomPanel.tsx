"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CreateRoomPanelProps {
  nickname: string;
  setNickname: (value: string) => void;
  disabled: boolean;
  onCreate: () => void;
}

export function CreateRoomPanel({ nickname, setNickname, disabled, onCreate }: CreateRoomPanelProps) {
  const t = useTranslations("lobby.create");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="create-nickname" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("nickname")}
          </label>
          <Input
            id="create-nickname"
            data-testid="create-nickname"
            value={nickname}
            maxLength={24}
            onChange={(event) => setNickname(event.target.value)}
            placeholder={t("nicknamePlaceholder")}
          />
        </div>
        <Button
          data-testid="create-room"
          className="w-full"
          disabled={disabled || nickname.trim().length === 0}
          onClick={onCreate}
        >
          <Sparkles aria-hidden className="h-4 w-4" />
          {t("submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
