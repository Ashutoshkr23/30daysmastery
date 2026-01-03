import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "static" | "interactive" | "default" | "hover" | "active"; // Keep old ones for back-compat if needed, or strict new ones
    intensity?: "low" | "medium" | "high";
    gradientBorder?: boolean;
}

export function GlassCard({
    children,
    className,
    variant = "static",
    intensity = "medium", // Kept for compatibility but mainly styled via base classes now
    gradientBorder = false,
    ...props
}: GlassCardProps) {

    const variants = {
        static: "bg-white/5 border-white/10 backdrop-blur-md",
        interactive: "bg-white/5 border-white/10 backdrop-blur-md hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 active:scale-[0.98] cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300",
                variants[variant as keyof typeof variants] || variants.static, // Fallback if old variant strings passed
                className
            )}
            {...props}
        >
            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-cover mix-blend-overlay" />

            <div className="relative z-10">
                {children}
            </div>

            {/* Gradient Border Overlay (Optional) */}
            {gradientBorder && (
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-100" />
            )}

            {/* Top Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-100" />
        </div>
    );
}
