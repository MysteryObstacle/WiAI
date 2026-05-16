"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CommandConsoleProps = {
  children: React.ReactNode;
  className?: string;
};

export const CommandConsole = React.forwardRef<HTMLDivElement, CommandConsoleProps>(
  function CommandConsole({ children, className }, ref) {
    return (
      <div
        ref={ref}
        data-testid="command-console"
        className={cn("min-w-0", className)}
      >
        {children}
      </div>
    );
  }
);
