import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
  {
    variants: {
      status: {
        host: "border border-primary/55 text-primary",
        ready: "border border-primary/55 text-primary",
        waiting: "border border-border text-muted-foreground",
        disconnected: "border border-destructive/55 text-destructive",
        online: "border border-primary/55 text-primary",
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
