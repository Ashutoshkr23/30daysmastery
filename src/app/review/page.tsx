import { getReviewCards } from "@/lib/actions/review";
import { ReviewGrid } from "@/app/review/ReviewGrid";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainCircuit } from "lucide-react";

export default async function ReviewPage() {
    const cards = await getReviewCards();

    return (
        <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <BrainCircuit className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                        Recall Protocol
                    </h1>
                    <p className="text-muted-foreground">
                        Review your bookmarked concepts and flashcards.
                    </p>
                </div>
            </header>

            {cards.length === 0 ? (
                <GlassCard className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                        <BrainCircuit className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <h2 className="text-xl font-semibold text-muted-foreground">No cards marked for review</h2>
                    <p className="text-sm text-muted-foreground/60 max-w-sm">
                        Mark difficult cards with the "Eye" icon during your study sessions to see them here.
                    </p>
                </GlassCard>
            ) : (
                <ReviewGrid initialCards={cards} />
            )}
        </div>
    );
}
