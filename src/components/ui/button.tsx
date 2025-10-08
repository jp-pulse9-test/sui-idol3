import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel text-xs uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-4 border-foreground",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--foreground))] hover:shadow-[0_2px_0_0_hsl(var(--foreground))] active:translate-y-2 active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--foreground))] hover:shadow-[0_2px_0_0_hsl(var(--foreground))] active:translate-y-2 active:shadow-none",
        outline:
          "border-4 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--primary))] hover:shadow-[0_2px_0_0_hsl(var(--primary))] active:translate-y-2 active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--foreground))] hover:shadow-[0_2px_0_0_hsl(var(--foreground))] active:translate-y-2 active:shadow-none",
        ghost: "border-0 bg-transparent hover:bg-muted hover:text-foreground shadow-none",
        link: "border-0 text-primary underline-offset-4 hover:underline shadow-none",
        hero: "bg-primary text-primary-foreground hover:translate-y-1 shadow-[0_6px_0_0_hsl(var(--foreground)),0_6px_0_0_hsl(var(--primary-glow))] hover:shadow-[0_3px_0_0_hsl(var(--foreground)),0_3px_0_0_hsl(var(--primary-glow))] active:translate-y-2 active:shadow-none",
        neon: "bg-transparent border-4 border-primary text-primary shadow-[0_0_0_2px_hsl(var(--primary-glow))] hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_0_4px_hsl(var(--primary-glow))]",
        gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--foreground))] hover:shadow-[0_2px_0_0_hsl(var(--foreground))] active:translate-y-2 active:shadow-none",
        premium: "bg-gradient-to-r from-accent via-primary to-secondary text-white hover:translate-y-1 shadow-[0_6px_0_0_hsl(var(--foreground)),0_0_0_2px_hsl(var(--accent-glow))] hover:shadow-[0_3px_0_0_hsl(var(--foreground)),0_0_0_4px_hsl(var(--accent-glow))] active:translate-y-2 active:shadow-none",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 py-1 text-[10px]",
        lg: "h-14 px-10 py-3 text-sm",
        xl: "h-16 px-12 py-4 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };