"use client";

import { useEffect, useState } from "react";
import { Badge, BadgesGrid } from "@/components/ui/Badges";
import { getBadges } from "@/lib/actions/gamification";
import { createClient } from "@/lib/supabase/client"; // Client-side auth
import { Loader2 } from "lucide-react";

// Mocking some badges definitions for now since we count on just IDs in DB
// In Phase 4 we'd make a badges table.
const BADGE_DEFINITIONS: Record<string, Badge> = {
    "first_login": { id: "first_login", name: "Welcome Aboard", description: "Joined the 30 Days Mastery journey", icon: "start", color: "from-blue-400 to-cyan-400" },
    "streak_3": { id: "streak_3", name: "3 Day Streak", description: "Consistency is key!", icon: "flame", color: "from-orange-400 to-red-400" },
    "streak_7": { id: "streak_7", name: "7 Day Streak", description: "Unstoppable force.", icon: "flame", color: "from-red-500 to-pink-500" },
    "quiz_master": { id: "quiz_master", name: "Quiz Master", description: "Scored 100% on a quiz", icon: "trophy", color: "from-yellow-400 to-amber-500" },
    "speed_demon": { id: "speed_demon", name: "Speed Demon", description: "Completed a sprint in under 60s", icon: "zap", color: "from-purple-400 to-violet-500" },
} as any;

export function BadgesView() {
    const [userBadges, setUserBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBadges() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const badgeIds: string[] = await getBadges(user.id);
                // Map IDs to full Badge objects
                // In real app, badgeIds would be generic and we map content constant

                // Demo: If no badges, show placeholders or 'first_login' if they logged in
                // For "Impressive" effect, let's assume they have 'first_login' if list is empty for demo purpose
                const idsToShow = badgeIds.length > 0 ? badgeIds : ["first_login"];

                const badges = idsToShow.map(id => BADGE_DEFINITIONS[id]).filter(Boolean);
                setUserBadges(badges);

            } catch (error) {
                console.error("Failed to load badges", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBadges();
    }, []);

    if (loading) return <div className="h-24 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    // Show locked placeholders for unearned ones to encourage them
    const allBadges = [
        BADGE_DEFINITIONS["first_login"],
        BADGE_DEFINITIONS["streak_3"],
        BADGE_DEFINITIONS["quiz_master"],
        BADGE_DEFINITIONS["speed_demon"]
    ];

    const displayBadges = allBadges.map(def => {
        const isUnlocked = userBadges.some(b => b.id === def.id);
        return {
            ...def,
            unlockedAt: isUnlocked ? new Date().toISOString() : undefined
        };
    });

    return <BadgesGrid badges={displayBadges} />;
}
