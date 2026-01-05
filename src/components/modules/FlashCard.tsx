"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface FlashCardProps {
    front: string;
    back: string;
    isMemorized?: boolean;
    onToggleMemorized?: () => void;
    // New Props for See Later
    isBookmarked?: boolean;
    onToggleBookmark?: () => void;
    index?: number;
}

export function FlashCard({
    front,
    back,
    isMemorized,
    onToggleMemorized,
    isBookmarked,
    onToggleBookmark,
    index = 0
}: FlashCardProps) {
    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleBookmark) onToggleBookmark();
    };

    return (
        <div className="h-full w-full group">
            <GlassCard
                className={cn(
                    "relative h-full w-full flex flex-col p-6 text-center border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors",
                    isMemorized && "border-green-500/30 bg-green-500/5"
                )}
            >
                {/* Header Actions */}
                <div className="w-full flex justify-end mb-2 relative z-20 min-h-[32px]">
                    {onToggleBookmark && (
                        <button
                            onClick={handleBookmark}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border",
                                isBookmarked
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
                                    : "bg-secondary/30 text-muted-foreground border-white/5 hover:bg-secondary/50 hover:text-white"
                            )}
                        >
                            <Eye className={cn("h-3 w-3", isBookmarked && "fill-current")} />
                            {isBookmarked ? "Remove" : "Recall"}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
                    <div>
                        <span className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-2 block">
                            Question / Concept
                        </span>
                        <h3 className="text-2xl font-bold text-foreground text-balance">
                            {front}
                        </h3>
                    </div>

                    <div className="w-12 h-[1px] bg-white/10" />

                    <div>
                        <span className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2 block">
                            Answer / Details
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-primary whitespace-pre-wrap leading-relaxed text-balance">
                            {back}
                        </h3>
                    </div>
                </div>

                {onToggleMemorized && (
                    <div
                        role="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleMemorized();
                        }}
                        className={cn(
                            "absolute bottom-4 right-4 p-2 rounded-full transition-all",
                            isMemorized
                                ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                : "bg-white/10 hover:bg-white/20 text-muted-foreground"
                        )}
                        title="Mark as Memorized"
                    >
                        <Check className="h-4 w-4" />
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
