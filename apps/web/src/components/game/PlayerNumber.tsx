import * as React from "react";
import { cn } from "@/lib/utils";

interface PlayerNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  number: number;
}

const PlayerNumber = React.forwardRef<HTMLSpanElement, PlayerNumberProps>(
  ({ className, number, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-surface-strong font-mono text-sm text-accent-strong",
        className
      )}
      {...props}
    >
      {number}
    </span>
  )
);
PlayerNumber.displayName = "PlayerNumber";

export { PlayerNumber };
