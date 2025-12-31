import { cn } from "@/lib/utils";
import React from "react";
import { Loader2 } from "lucide-react";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export function PremiumButton({
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    disabled,
    ...props
}: PremiumButtonProps) {
    const variants = {
        primary: "bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] border-none",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02]",
        outline: "border-2 border-primary/20 bg-transparent text-primary hover:border-primary/50 hover:bg-primary/5",
        ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        glass: "bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 text-foreground dark:text-white hover:bg-white/20 dark:hover:bg-white/10 shadow-sm",
    };

    const sizes = {
        sm: "h-9 px-4 text-xs rounded-lg",
        md: "h-11 px-6 text-sm rounded-xl",
        lg: "h-14 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={cn(
                "relative inline-flex items-center justify-center font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && icon && <span className="mr-2">{icon}</span>}
            {children}

            {/* Shimmer effect for primary button */}
            {variant === 'primary' && !isLoading && !disabled && (
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
        </button>
    );
}
