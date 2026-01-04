"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";
import { Sparkles, BrainCircuit, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

// Define strict types based on the new JSON structure
interface StudyDeckProps {
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

export function StudyCardDeck({ content, onComplete }: StudyDeckProps) {
    // Adapter for Legacy Data: If groups are missing, convert items to a single group
    const roteGroups = content.rote.groups || (content.rote.items ? [{
        title: "Daily Vitamin",
        items: content.rote.items.map(item => ({ q: item.front, a: item.back }))
    }] : []);

    // Flatten the deck: Card 0 is Concept, Cards 1..N are Rote Groups
    const totalCards = 1 + roteGroups.length;
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const isConceptCard = currentCardIndex === 0;
    const roteGroupIndex = currentCardIndex - 1;
    const currentRoteGroup = !isConceptCard ? roteGroups[roteGroupIndex] : null;

    const progress = ((currentCardIndex + 1) / totalCards) * 100;

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
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        Card {currentCardIndex + 1} of {totalCards}
                    </span>
                    <div className="w-32 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
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
                <GlassCard className="h-full p-8 md:p-12 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-right-4">

                    {/* TYPE 1: CONCEPT CARD */}
                    {isConceptCard && (
                        <div className="space-y-8 h-full flex flex-col">
                            <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <Sparkles className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">
                                        Mental Hack
                                    </h2>
                                    <p className="text-sm text-indigo-300/60 font-medium">Concept Mastery</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-foreground/90">{content.concept.title}</h3>
                                    <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
                                        {content.concept.description.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2">{line}</p>
                                        ))}
                                    </div>
                                </div>

                                {content.concept.example && (
                                    <div className="bg-black/40 rounded-xl p-6 border border-white/5 backdrop-blur-md shadow-inner">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Live Example</h4>
                                        <div className="flex flex-col items-center justify-center py-4 space-y-6">
                                            <div className="flex items-center gap-8 text-4xl font-mono">
                                                <div className="text-white font-bold">{content.concept.example.problem}</div>
                                                <ArrowRight className="h-8 w-8 text-muted-foreground/50" />
                                                <div className="text-green-400 font-bold drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                                                    {content.concept.example.solution}
                                                </div>
                                            </div>

                                            {content.concept.example.steps && (
                                                <div className="w-full bg-white/5 rounded-lg p-4 border border-white/5">
                                                    <p className="text-sm text-indigo-200/80 font-mono whitespace-pre-wrap">
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
                        <div className="space-y-8 h-full flex flex-col">
                            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
                                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <BrainCircuit className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
                                        Memory Bank
                                    </h2>
                                    <p className="text-sm text-amber-300/60 font-medium">{currentRoteGroup.title}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentRoteGroup.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                                        >
                                            <span className="text-lg font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                                                {item.q}
                                            </span>
                                            <span className="text-xl font-bold font-mono text-primary group-hover:scale-110 transition-transform">
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
                <div className="mt-8 flex justify-end">
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
