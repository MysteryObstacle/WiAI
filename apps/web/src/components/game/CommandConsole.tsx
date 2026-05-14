"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CommandConsoleProps = {
  children: React.ReactNode;
  className?: string;
};

export const CommandConsole = React.forwardRef<HTMLDivElement, CommandConsoleProps>(
  function CommandConsole({ children, className }, ref) {
    return (
      <Card
        ref={ref}
        data-testid="command-console"
        className={cn("min-h-[520px] overflow-hidden", className)}
      >
        <CardContent className="flex h-full flex-col gap-4 p-5">{children}</CardContent>
      </Card>
    );
  }
);
