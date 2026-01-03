'use server';

import { createClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
    user_id: string;
    name: string;
    avatar_url?: string;
    score: number;
    time_taken: number;
    accuracy: number;
    rank: number;
    created_at: string;
}

export async function getLeaderboard(courseId: string, dayId: number): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();

    // Fetch top 50 attempts for this day, ordered by Score DESC, then Time ASC
    const { data: attempts, error } = await supabase
        .from('course_attempts')
        .select(`
            id,
            user_id,
            score,
            time_taken,
            accuracy,
            created_at,
            profiles:user_id (
                username,
                full_name,
                avatar_url
            )
        `)
        .eq('course_id', courseId)
        .eq('day_id', dayId)
        .eq('passed', true)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true })
        .limit(50);

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }

    // Transform and add rank
    return attempts.map((attempt: any, index: number) => ({
        user_id: attempt.user_id,
        name: attempt.profiles?.full_name || attempt.profiles?.username || "Anonymous",
        avatar_url: attempt.profiles?.avatar_url,
        score: attempt.score,
        time_taken: attempt.time_taken,
        accuracy: attempt.accuracy,
        rank: index + 1,
        created_at: attempt.created_at
    }));
}
