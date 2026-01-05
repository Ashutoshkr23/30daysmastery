"use client";

import { FlashCard } from "@/components/modules/FlashCard";
import { ReviewCard, toggleReviewCard } from "@/lib/actions/review";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ReviewGrid({ initialCards }: { initialCards: ReviewCard[] }) {
    const [cards, setCards] = useState(initialCards);

    const handleToggleBookmark = async (card: ReviewCard) => {
        // Optimistic remove
        setCards(prev => prev.filter(c => c.id !== card.id));

        await toggleReviewCard({
            courseId: card.course_id,
            cardId: card.card_id,
            front: card.front,
            back: card.back
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {cards.map((card) => (
                    <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FlashCard
                            front={card.front}
                            back={card.back}
                            isBookmarked={true}
                            onToggleBookmark={() => handleToggleBookmark(card)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
