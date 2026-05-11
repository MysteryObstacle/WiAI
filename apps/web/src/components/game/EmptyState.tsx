import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, message, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground",
        className
      )}
      {...props}
    >
      {message}
    </div>
  )
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
