"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, RotateCw, Eye } from "lucide-react";
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
    const [isFlipped, setIsFlipped] = useState(false);

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleBookmark) onToggleBookmark();
    };

    return (
        <div
            className="perspective-1000 h-64 w-full cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="relative h-full w-full preserve-3d"
            >
                {/* Front Side */}
                <GlassCard
                    className={cn(
                        "absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors",
                        isMemorized && "border-green-500/30 bg-green-500/5"
                    )}
                >
                    <div className="absolute top-4 right-4 flex gap-2">
                        {onToggleBookmark && (
                            <button
                                onClick={handleBookmark}
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    isBookmarked
                                        ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                                        : "text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10"
                                )}
                                title="See Later (Recall)"
                            >
                                <Eye className={cn("h-5 w-5", isBookmarked && "fill-current")} />
                            </button>
                        )}
                    </div>

                    <span className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-4">
                        Memorize
                    </span>
                    <h3 className="text-3xl font-bold text-foreground max-w-full text-balance">
                        {front}
                    </h3>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground flex items-center gap-1">
                        <RotateCw className="h-3 w-3" /> Flip
                    </div>
                </GlassCard>

                {/* Back Side */}
                <GlassCard
                    className={cn(
                        "absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center border-primary/20 bg-primary/5",
                        isMemorized && "border-green-500/30 bg-green-500/5"
                    )}
                >
                    <div className="absolute top-4 right-4 flex gap-2">
                        {onToggleBookmark && (
                            <button
                                onClick={handleBookmark}
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    isBookmarked
                                        ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                                        : "text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10"
                                )}
                                title="See Later (Recall)"
                            >
                                <Eye className={cn("h-5 w-5", isBookmarked && "fill-current")} />
                            </button>
                        )}
                    </div>

                    <span className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-4">
                        Recall
                    </span>
                    {/* Use whitespace-pre-wrap to handle newlines in tables */}
                    <h3 className="text-xl md:text-2xl font-bold text-primary w-full whitespace-pre-wrap leading-relaxed">
                        {back}
                    </h3>

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
                        >
                            <Check className="h-4 w-4" />
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
}
