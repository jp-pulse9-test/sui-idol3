import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-secondary",
        ghost: "hover:bg-accent hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-white font-bold shadow-glow-primary hover:scale-105 hover:shadow-xl transform transition-all border border-primary/30 hover:text-white hover:bg-gradient-secondary",
        neon: "bg-transparent border-2 border-primary text-primary shadow-glow-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold",
        gradient: "bg-gradient-secondary text-white font-bold hover:scale-105 transform transition-all shadow-glow-secondary hover:text-white",
        premium: "bg-gradient-to-r from-accent via-primary to-secondary text-white hover:shadow-glow-accent transition-all duration-300 font-semibold border border-primary/30 hover:text-white",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-lg px-10 text-base",
        xl: "h-16 rounded-xl px-12 text-lg",
        icon: "h-11 w-11",
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