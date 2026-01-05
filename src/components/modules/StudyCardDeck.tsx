"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { Sparkles, BrainCircuit, ArrowRight, ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import { toggleReviewCard, getReviewStatus } from "@/lib/actions/review";

// Define strict types based on the new JSON structure
interface StudyDeckProps {
    courseId?: string; // Added courseId
    dayId?: number;    // Added dayId
    content: {
        concept: {
            title: string;
            description: string;
            example?: {
                problem: string;
                solution: string;
                steps: string;
            };
        };
        rote: {
            title: string;
            // Support both new (groups) and old (items) structure
            groups?: Array<{
                title: string;
                items: Array<{ q: string; a: string }>;
            }>;
            items?: Array<{ front: string; back: string }>;
        };
    };
    onComplete: () => void;
}

export function StudyCardDeck({ content, onComplete, courseId = "speed-maths", dayId }: StudyDeckProps) {
    // Adapter for Legacy Data: If groups are missing, convert items to a single group
    const roteGroups = content.rote.groups || (content.rote.items ? [{
        title: "Daily Vitamin",
        items: content.rote.items.map(item => ({ q: item.front, a: item.back }))
    }] : []);

    // Flatten the deck: Card 0 is Concept, Cards 1..N are Rote Groups
    const totalCards = 1 + roteGroups.length;
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    // Store bookmarked card IDs (e.g. "concept", "group-0", "group-1")
    const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());

    const isConceptCard = currentCardIndex === 0;
    const roteGroupIndex = currentCardIndex - 1;
    const currentRoteGroup = !isConceptCard ? roteGroups[roteGroupIndex] : null;

    const currentCardId = isConceptCard
        ? `${dayId || 'd1'}-concept`
        : `${dayId || 'd1'}-rote-${roteGroupIndex}`;

    const progress = ((currentCardIndex + 1) / totalCards) * 100;

    useEffect(() => {
        // Fetch initial bookmarks
        getReviewStatus(courseId).then(ids => {
            setBookmarkedCards(new Set(ids));
        });
    }, [courseId]);

    const handleToggleBookmark = async () => {
        const isBookmarked = bookmarkedCards.has(currentCardId);
        const newSet = new Set(bookmarkedCards);

        let frontContent = "";
        let backContent = "";

        if (isConceptCard) {
            frontContent = content.concept.title;
            backContent = content.concept.description; // Simplified
        } else if (currentRoteGroup) {
            frontContent = currentRoteGroup.title;
            // Serialize items for the back
            backContent = currentRoteGroup.items.map(i => `${i.q} = ${i.a}`).join('\n');
        }

        if (isBookmarked) {
            newSet.delete(currentCardId);
        } else {
            newSet.add(currentCardId);
        }
        setBookmarkedCards(newSet);

        // Server action
        await toggleReviewCard({
            courseId,
            cardId: currentCardId,
            front: frontContent,
            back: backContent
        });
    };

    const handleNext = () => {
        if (currentCardIndex < totalCards - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[500px]">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-6 px-2">
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

            {/* Card Content Area */}
            <div className="flex-1 relative perspective-1000">
                {/* Reduced padding for mobile from p-8 to p-4 md:p-12 */}
                <GlassCard className="h-full p-4 md:p-12 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-right-4 relative">

                    {/* Bookmark Button */}
                    <div className="absolute top-4 right-4 z-10">
                        <button
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
                    {isConceptCard && (
                        <div className="space-y-6 md:space-y-8 h-full flex flex-col">
                            <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <Sparkles className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">
                                        Mental Hack
                                    </h2>
                                    <p className="text-xs md:text-sm text-indigo-300/60 font-medium">Concept Mastery</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold mb-4 text-foreground/90">{content.concept.title}</h3>
                                    <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-base md:text-lg">
                                        {content.concept.description.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2">{line}</p>
                                        ))}
                                    </div>
                                </div>

                                {content.concept.example && (
                                    <div className="bg-black/40 rounded-xl p-4 md:p-6 border border-white/5 backdrop-blur-md shadow-inner">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 md:mb-6">Live Example</h4>
                                        <div className="flex flex-col items-center justify-center py-4 space-y-6">
                                            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-3xl md:text-4xl font-mono">
                                                <div className="text-white font-bold">{content.concept.example.problem}</div>
                                                <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                                                <div className="text-green-400 font-bold drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                                                    {content.concept.example.solution}
                                                </div>
                                            </div>

                                            {content.concept.example.steps && (
                                                <div className="w-full bg-white/5 rounded-lg p-4 border border-white/5">
                                                    <p className="text-xs md:text-sm text-indigo-200/80 font-mono whitespace-pre-wrap">
                                                        {content.concept.example.steps}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {currentRoteGroup.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex items-center justify-between p-3 md:p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                                        >
                                            <span className="text-base md:text-lg font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                                                {item.q}
                                            </span>
                                            <span className="text-lg md:text-xl font-bold font-mono text-primary group-hover:scale-110 transition-transform">
                                                {item.a}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </GlassCard>

                {/* Action Footer */}
                <div className="mt-6 md:mt-8 flex justify-end">
                    <PremiumButton
                        onClick={handleNext}
                        className="w-full sm:w-auto min-w-[200px]"
                    >
                        {currentCardIndex === totalCards - 1 ? (
                            <span className="flex items-center gap-2">
                                Complete Protocol <CheckCircle2 className="h-4 w-4" />
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Next Card <ArrowRight className="h-4 w-4" />
                            </span>
                        )}
                    </PremiumButton>
                </div>
            </div>
        </div>
    );
}
