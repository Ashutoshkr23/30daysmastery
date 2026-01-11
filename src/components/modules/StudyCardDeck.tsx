"use client";

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { Sparkles, BrainCircuit, ArrowRight, ArrowLeft, CheckCircle2, Eye, RotateCcw, Calculator } from "lucide-react";
import { toggleReviewCard, getReviewStatus } from "@/lib/actions/review";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo, AnimatePresence } from "framer-motion";

// ... (Existing Interfaces)
import { PracticeConfig } from "@/types/course";

// ... (Existing Interfaces)
interface StudyDeckProps {
    courseId?: string;
    dayId?: number;
    content: {
        concept: {
            title: string;
            description: string;
            example?: {
                problem: string;
                solution: string;
                steps: string;
            };
            practiceConfig?: PracticeConfig;
        } | Array<{
            title: string;
            description: string;
            example?: {
                problem: string;
                solution: string;
                steps: string;
            };
            practiceConfig?: PracticeConfig;
        }>;
        rote: {
            title: string;
            groups?: Array<{
                title: string;
                items: Array<{ q: string; a: string }>;
            }>;
            items?: Array<{ front: string; back: string }>;
            practiceConfig?: PracticeConfig;
        };
    };
    onComplete: () => void;
    onStartPractice?: (config: PracticeConfig, title: string) => void;
    completedTasks?: string[];
}

export function StudyCardDeck({ content, onComplete, onStartPractice, completedTasks = [], courseId = "speed-maths", dayId }: StudyDeckProps) {
    const roteGroups = content.rote.groups || (content.rote.items ? [{
        title: "Daily Vitamin",
        items: content.rote.items.map(item => ({ q: item.front, a: item.back }))
    }] : []);

    // Normalize concepts to an array
    const concepts = Array.isArray(content.concept) ? content.concept : [content.concept];

    // Total cards = all concepts + all rote groups
    const totalCards = concepts.length + roteGroups.length;

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());
    const [direction, setDirection] = useState(0); // -1 for left (next), 1 for right (prev) - Wait, Swipe Left = Next (-x)

    // Determine current card type
    const isConceptCard = currentCardIndex < concepts.length;
    const currentConcept = isConceptCard ? concepts[currentCardIndex] : null;

    // Rote cards start after concept cards
    const roteGroupIndex = currentCardIndex - concepts.length;
    const currentRoteGroup = !isConceptCard ? roteGroups[roteGroupIndex] : null;

    // Generate unique ID
    const currentCardId = isConceptCard
        ? `${dayId || 'd1'}-concept-${currentCardIndex}`
        : `${dayId || 'd1'}-rote-${roteGroupIndex}`;

    const progress = ((currentCardIndex + 1) / totalCards) * 100;

    // Animation Controls
    const controls = useAnimation();
    const x = useMotionValue(0);
    // Rotate slightly based on x position: -200px -> -10deg
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    useEffect(() => {
        getReviewStatus(courseId).then(ids => {
            setBookmarkedCards(new Set(ids));
        });
    }, [courseId]);

    const handleToggleBookmark = async () => {
        const isBookmarked = bookmarkedCards.has(currentCardId);
        const newSet = new Set(bookmarkedCards);

        let frontContent = "";
        let backContent = "";

        if (currentConcept) {
            frontContent = currentConcept.title;
            backContent = currentConcept.description;
        } else if (currentRoteGroup) {
            frontContent = currentRoteGroup.title;
            backContent = currentRoteGroup.items.map(i => `${i.q} = ${i.a}`).join('\n');
        }

        if (isBookmarked) {
            newSet.delete(currentCardId);
        } else {
            newSet.add(currentCardId);
        }
        setBookmarkedCards(newSet);

        await toggleReviewCard({
            courseId,
            cardId: currentCardId,
            front: frontContent,
            back: backContent
        });
    };

    const handleNext = async () => {
        console.log("Handle Next Triggered");
        if (currentCardIndex < totalCards - 1) {
            setDirection(1); // Moving forward
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
            setCurrentCardIndex(prev => prev + 1);
            x.set(0);
            controls.set({ x: 0, opacity: 1 }); // Reset for new card
        } else {
            // Last card swipe triggers complete
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
            onComplete();
        }
    };

    const handlePrev = async () => {
        if (currentCardIndex > 0) {
            setDirection(-1); // Moving backward
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
            setCurrentCardIndex(prev => prev - 1);
            x.set(0);
            controls.set({ x: 0, opacity: 1 });
        }
    };

    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const swipeThreshold = 50; // reduced from 100 for better sensitivity

        // Swipe Left (<-) : Next
        if (offset < -swipeThreshold || velocity < -500) {
            await handleNext();
        }
        // Swipe Right (->) : Prev
        else if (offset > swipeThreshold || velocity > 500) {
            if (currentCardIndex > 0) {
                await handlePrev();
            } else {
                // Snap back if no prev
                controls.start({ x: 0, opacity: 1 });
            }
        }
        // Snap Back
        else {
            controls.start({ x: 0, opacity: 1 });
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[500px] overflow-hidden">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-2 md:mb-6 px-2">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Card {currentCardIndex + 1}/{totalCards}
                    </span>
                    <div className="w-24 md:w-32 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentCardIndex === 0}
                        className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Card Content Area - Swipeable Wrapper */}
            <div className="flex-1 relative perspective-1000 flex items-center justify-center w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCardIndex}
                        drag="x"
                        // Removed constraints to allow free movement (snap-back handled by onDragEnd)
                        onDragEnd={handleDragEnd}
                        style={{ x, rotate, opacity, touchAction: "pan-y" }} // Explicit touch-action
                        initial={{ opacity: 0, scale: 0.9, x: direction === 1 ? 100 : -100 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="h-full w-full cursor-grab active:cursor-grabbing"
                    >
                        {/* Reduced padding for mobile from p-8 to p-4 md:p-12. Now even minimal. */}
                        <GlassCard className="h-full px-2 py-4 md:p-12 relative w-full select-none">

                            {/* Bookmark Button */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={handleToggleBookmark}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border",
                                        bookmarkedCards.has(currentCardId)
                                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
                                            : "bg-secondary/30 text-muted-foreground border-white/5 hover:bg-secondary/50 hover:text-white"
                                    )}
                                >
                                    <Eye className={cn("h-3 w-3", bookmarkedCards.has(currentCardId) && "fill-current")} />
                                    {bookmarkedCards.has(currentCardId) ? "Recall Saved" : "Recall"}
                                </button>
                            </div>

                            {/* TYPE 1: CONCEPT CARD */}
                            {currentConcept && (
                                <div className="space-y-6 md:space-y-8 h-full flex flex-col">
                                    <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                            <Sparkles className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">
                                                Mental Hack
                                            </h2>
                                            <p className="text-xs md:text-sm text-indigo-300/60 font-medium">{currentConcept.title}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                                        {/* Content */}
                                        <div>
                                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-base md:text-lg">
                                                {currentConcept.description.split('\n').map((line: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
                                                    <p key={i} className="mb-2">{line}</p>
                                                ))}
                                            </div>
                                        </div>

                                        {currentConcept.example && (
                                            <div className="bg-black/40 rounded-xl p-3 md:p-6 border border-white/5 backdrop-blur-md shadow-inner">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 md:mb-6">Live Example</h4>
                                                <div className="flex flex-col items-center justify-center py-4 space-y-6">
                                                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-3xl md:text-4xl font-mono">
                                                        <div className="text-white font-bold">{currentConcept.example.problem}</div>
                                                        <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                                                        <div className="text-green-400 font-bold drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                                                            {currentConcept.example.solution}
                                                        </div>
                                                    </div>

                                                    {currentConcept.example.steps && (
                                                        <div className="w-full bg-white/5 rounded-lg p-4 border border-white/5">
                                                            <p className="text-xs md:text-sm text-indigo-200/80 font-mono whitespace-pre-wrap">
                                                                {currentConcept.example.steps}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Practice Button */}
                                        {/* Practice Button */}
                                        {currentConcept.practiceConfig && onStartPractice && (() => {
                                            const isMastered = completedTasks.includes(currentConcept.title);
                                            return (
                                                <div className="space-y-3 mt-4">
                                                    {isMastered && (
                                                        <div className="flex items-center gap-2 text-green-400 font-bold justify-center bg-green-500/10 p-2 rounded-lg border border-green-500/20 animate-in fade-in zoom-in duration-300">
                                                            <CheckCircle2 className="h-5 w-5" />
                                                            <span>Concept Mastered!</span>
                                                        </div>
                                                    )}
                                                    <PremiumButton
                                                        onClick={() => onStartPractice(currentConcept.practiceConfig!, currentConcept.title)}
                                                        className={cn(
                                                            "w-full border",
                                                            isMastered
                                                                ? "bg-green-500/5 hover:bg-green-500/10 text-green-300 border-green-500/20"
                                                                : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/50"
                                                        )}
                                                    >
                                                        <Calculator className="mr-2 h-4 w-4" />
                                                        {isMastered ? "Practice Again" : `Practice This Concept (${currentConcept.practiceConfig.questionCount} Questions)`}
                                                    </PremiumButton>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* TYPE 2: ROTE GROUP CARD */}
                            {currentRoteGroup && (
                                <div className="space-y-6 md:space-y-8 h-full flex flex-col">
                                    <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
                                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                            <BrainCircuit className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
                                                Memory Bank
                                            </h2>
                                            <p className="text-xs md:text-sm text-amber-300/60 font-medium">{currentRoteGroup.title}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <div className={cn(
                                            "grid gap-3 md:gap-4",
                                            currentRoteGroup.items.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                                        )}>
                                            {currentRoteGroup.items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                                                >
                                                    <span className="text-sm md:text-base font-mono text-muted-foreground group-hover:text-foreground transition-colors mb-2 md:mb-0">
                                                        {item.q}
                                                    </span>
                                                    <span className="text-base md:text-lg font-bold font-mono text-primary whitespace-pre-line text-right w-full md:w-auto leading-relaxed">
                                                        {item.a}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Practice Button for Rote */}
                                    {/* @ts-ignore - Local type definition check */}
                                    {currentRoteGroup.practiceConfig && onStartPractice && (() => {
                                        // @ts-ignore
                                        const isMastered = completedTasks.includes(currentRoteGroup.title);
                                        return (
                                            <div className="mt-6 space-y-3">
                                                {isMastered && (
                                                    <div className="flex items-center gap-2 text-green-400 font-bold justify-center bg-green-500/10 p-2 rounded-lg border border-green-500/20 animate-in fade-in zoom-in duration-300">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        <span>Table Mastered!</span>
                                                    </div>
                                                )}
                                                <PremiumButton
                                                    // @ts-ignore
                                                    onClick={() => onStartPractice(currentRoteGroup.practiceConfig!, currentRoteGroup.title)}
                                                    className={cn(
                                                        "w-full border",
                                                        isMastered
                                                            ? "bg-green-500/5 hover:bg-green-500/10 text-green-300 border-green-500/20"
                                                            : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50"
                                                    )}
                                                >
                                                    <Calculator className="mr-2 h-4 w-4" />
                                                    {isMastered ? "Practice Again" : `Practice ${currentRoteGroup.title}`}
                                                </PremiumButton>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                        </GlassCard>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-4 flex justify-center text-xs text-muted-foreground/40 md:hidden">
                Swipe left to continue
            </div>
        </div >
    );
}
