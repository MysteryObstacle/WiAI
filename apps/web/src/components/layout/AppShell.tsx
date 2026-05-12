import * as React from "react";
import { cn } from "@/lib/utils";

interface AppShellProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "game";
}

const AppShell = React.forwardRef<HTMLElement, AppShellProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <main
      ref={ref}
      className={cn(
        "relative min-h-screen p-8",
        variant === "game" && "p-5",
        className
      )}
      {...props}
    />
  )
);
AppShell.displayName = "AppShell";

type AppShellContainerProps = React.HTMLAttributes<HTMLElement>;

const AppShellContainer = React.forwardRef<HTMLElement, AppShellContainerProps>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn("mx-auto w-full max-w-[1180px]", className)}
      {...props}
    />
  )
);
AppShellContainer.displayName = "AppShellContainer";

export { AppShell, AppShellContainer };
