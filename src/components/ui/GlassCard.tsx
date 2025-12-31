import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "hover" | "active";
    intensity?: "low" | "medium" | "high"; // Kept for API compatibility but overridden in styles
    gradientBorder?: boolean;
}

export function GlassCard({
    children,
    className,
    variant = "default",
    intensity = "medium", // Unused in new design but kept for props
    gradientBorder = false,
    ...props
}: GlassCardProps) {

    const baseStyles = "relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300";

    // Explicit, non-global-variable styles for consistent premium look
    // Using arbitrary selector [.dark_&] to FORCE match the parent .dark class, bypassing tailwind config issues
    // FIXED: Added [.dark_&]:bg-transparent to prevent light-mode bg-white from bleeding through the dark gradient
    // UPDATED: Increased dark mode opacity to /90 for better text readability
    const themeStyles = "bg-white/70 [.dark_&]:bg-transparent [.dark_&]:bg-gradient-to-br [.dark_&]:from-[#131124]/90 [.dark_&]:to-[#0b1021]/90 border-white/20 [.dark_&]:border-primary/20 backdrop-blur-xl";

    const variantStyles = {
        default: "shadow-lg",
        hover: "shadow-lg hover:-translate-y-1 hover:shadow-xl hover:bg-white/80 [.dark_&]:hover:bg-transparent [.dark_&]:hover:from-[#1c1836]/95 [.dark_&]:hover:to-[#131124]/95 [.dark_&]:hover:border-primary/40",
        active: "border-primary/50 shadow-[0_0_20px_rgba(124,58,237,0.2)] bg-white/90 [.dark_&]:bg-transparent [.dark_&]:from-[#1c1836] [.dark_&]:to-[#0a0a12]",
    };

    return (
        <div
            className={cn(
                baseStyles,
                themeStyles,
                variantStyles[variant],
                gradientBorder && "before:absolute before:inset-0 before:-z-10 before:p-[1px] before:bg-gradient-to-r before:from-transparent via-primary/40 before:to-transparent before:content-['']",
                className
            )}
            {...props}
        >
            {/* Top Shine/Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100" />

            {/* Gradient Border Overlay (Optional reinforcement) */}
            {gradientBorder && (
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
            )}

            {children}

            {/* Premium Gloss/Sheen Effect - purely decorative */}
            <div className="pointer-events-none absolute -inset-[100%] z-0 rotate-45 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

            {/* Inner Glow for Depth - Reduced opacity for readability */}
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/[0.02] opacity-0 dark:opacity-100" />
        </div>
    );
}
