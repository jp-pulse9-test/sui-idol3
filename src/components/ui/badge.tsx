import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border-2 border-foreground px-2 py-1 font-pixel text-[10px] uppercase tracking-wide transition-all focus:outline-none shadow-[2px_2px_0_0_hsl(var(--foreground))]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))]",
        secondary: "bg-secondary text-secondary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))]",
        destructive: "bg-destructive text-destructive-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))]",
        outline: "bg-background text-foreground border-2 border-primary hover:bg-primary hover:text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
