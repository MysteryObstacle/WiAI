"use client";

import { useTranslations } from "next-intl";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface JoinRoomPanelProps {
  nickname: string;
  setNickname: (value: string) => void;
  roomCode: string;
  setRoomCode: (value: string) => void;
  disabled: boolean;
  onJoin: () => void;
}

export function JoinRoomPanel({
  nickname,
  setNickname,
  roomCode,
  setRoomCode,
  disabled,
  onJoin
}: JoinRoomPanelProps) {
  const t = useTranslations("lobby.join");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="join-nickname" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("nickname")}
          </label>
          <Input
            id="join-nickname"
            data-testid="join-nickname"
            value={nickname}
            maxLength={24}
            onChange={(event) => setNickname(event.target.value)}
            placeholder={t("nicknamePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="join-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("roomCode")}
          </label>
          <Input
            id="join-code"
            data-testid="join-code"
            value={roomCode}
            maxLength={16}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder={t("roomCodePlaceholder")}
          />
        </div>
        <Button
          data-testid="join-room"
          variant="secondary"
          className="w-full"
          disabled={disabled || nickname.trim().length === 0 || roomCode.trim().length === 0}
          onClick={onJoin}
        >
          <LogIn aria-hidden className="h-4 w-4" />
          {t("submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
