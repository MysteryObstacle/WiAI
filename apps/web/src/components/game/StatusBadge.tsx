import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
  {
    variants: {
      status: {
        host: "border border-accent/55 text-accent-strong",
        ready: "border border-accent/55 text-accent-strong",
        waiting: "border border-border text-muted-foreground",
        disconnected: "border border-danger/55 text-danger",
        online: "border border-accent/55 text-accent-strong",
        current: "border border-warning/55 text-warning"
      }
    },
    defaultVariants: {
      status: "waiting"
    }
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  label: string;
}

function StatusBadge({ className, status, label, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {label}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
