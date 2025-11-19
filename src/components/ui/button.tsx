import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel text-xs uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-2 border-primary-foreground hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--primary-foreground))] hover:shadow-[0_2px_0_0_hsl(var(--primary-foreground))] active:translate-y-2 active:shadow-none transition-all duration-150",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-foreground hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--foreground))] hover:shadow-[0_2px_0_0_hsl(var(--foreground))] active:translate-y-2 active:shadow-none",
        outline:
          "border-2 border-primary bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary/10 hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--primary))] hover:shadow-[0_2px_0_0_hsl(var(--primary))] active:translate-y-2 active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-foreground hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--foreground))] hover:shadow-[0_2px_0_0_hsl(var(--foreground))] active:translate-y-2 active:shadow-none",
        ghost: "border-0 bg-transparent hover:bg-primary/10 hover:text-primary shadow-none transition-colors duration-200",
        link: "border-0 text-primary underline-offset-4 hover:underline shadow-none",
        hero: "bg-gradient-to-r from-primary via-secondary to-accent text-background font-bold border-2 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] hover:scale-105 transition-all duration-300",
        neon: "bg-transparent border-2 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)] hover:bg-primary hover:text-background hover:shadow-[0_0_25px_hsl(var(--primary)/0.7)] transition-all duration-300",
        gradient: "bg-gradient-to-r from-primary to-secondary text-background border-2 border-primary/20 hover:translate-y-1 shadow-[0_4px_0_0_hsl(var(--foreground))] hover:shadow-[0_2px_0_0_hsl(var(--foreground))] active:translate-y-2 active:shadow-none",
        premium: "bg-gradient-to-br from-primary via-accent to-secondary text-background font-bold border-2 border-primary/30 shadow-[0_4px_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_6px_30px_hsl(var(--primary)/0.5)] hover:scale-[1.02] transition-all duration-300",
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