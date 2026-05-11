import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-7 flex items-center gap-4", className)} {...props} />
));
PageHeader.displayName = "PageHeader";

interface BrandMarkProps extends React.HTMLAttributes<HTMLDivElement> {}

const BrandMark = React.forwardRef<HTMLDivElement, BrandMarkProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid h-14 w-14 place-items-center rounded-lg border border-accent/45 bg-[#0f1b20] text-accent-strong font-bold text-lg",
      className
    )}
    {...props}
  >
    Wi
  </div>
));
BrandMark.displayName = "BrandMark";

interface PageTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

const PageTitle = React.forwardRef<HTMLDivElement, PageTitleProps>(
  ({ className, title, description, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  )
);
PageTitle.displayName = "PageTitle";

export { PageHeader, BrandMark, PageTitle };
