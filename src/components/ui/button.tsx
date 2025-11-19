import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel text-xs uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-secondary text-black border-2 border-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.5)] hover:shadow-[0_0_35px_hsl(var(--secondary)/0.8)] hover:scale-105 transition-all duration-300",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive shadow-[0_0_15px_hsl(var(--destructive)/0.4)] hover:shadow-[0_0_25px_hsl(var(--destructive)/0.6)] transition-all duration-300",
        outline:
          "border-2 border-secondary bg-transparent text-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.3)] hover:bg-secondary/10 hover:shadow-[0_0_25px_hsl(var(--secondary)/0.6)] transition-all duration-300",
        secondary:
          "bg-secondary/20 text-secondary border-2 border-secondary/50 shadow-[0_0_10px_hsl(var(--secondary)/0.3)] hover:bg-secondary/30 hover:shadow-[0_0_20px_hsl(var(--secondary)/0.5)] transition-all duration-300",
        ghost: "border-0 bg-transparent text-secondary/80 hover:bg-secondary/5 hover:text-secondary hover:shadow-[0_0_10px_hsl(var(--secondary)/0.2)] transition-all duration-200",
        link: "text-secondary underline-offset-4 hover:underline hover:text-secondary-glow",
        hero: "bg-secondary text-black font-bold border-2 border-secondary shadow-[0_0_30px_hsl(var(--secondary)/0.6),0_0_60px_hsl(var(--secondary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--secondary)/0.9),0_0_100px_hsl(var(--secondary)/0.5)] hover:scale-110 animate-neon-green transition-all duration-300",
        neon: "bg-transparent border-2 border-secondary text-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.5)] hover:bg-secondary hover:text-black hover:shadow-[0_0_25px_hsl(var(--secondary)/0.7)] transition-all duration-300",
        gradient: "bg-gradient-to-r from-secondary via-secondary-glow to-secondary text-black border-2 border-secondary/20 shadow-[0_0_25px_hsl(var(--secondary)/0.4)] hover:shadow-[0_0_40px_hsl(var(--secondary)/0.7)] hover:scale-105 transition-all duration-300",
        premium: "bg-gradient-to-br from-secondary via-secondary-glow to-accent text-black font-bold border-2 border-secondary/30 shadow-[0_4px_20px_hsl(var(--secondary)/0.3)] hover:shadow-[0_6px_30px_hsl(var(--secondary)/0.5)] hover:scale-[1.02] transition-all duration-300",
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