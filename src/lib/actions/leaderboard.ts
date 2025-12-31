"use server";

import { createClient } from "@/lib/supabase/server";

export type LeaderboardEntry = {
    rank: number;
    user_id: string;
    name: string;
    avatar_url?: string;
    score: number;
    time_taken: number;
    accuracy: number;
    created_at: string;
};

export async function getLeaderboard(courseId: string, dayId: number): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();

    // Fetch top attempts
    // We want the BEST attempt per user? Or just all top attempts?
    // Traditionally generic leaderboards show top attempts.
    // However, we probably want distinct users.
    // Supabase/Postgres doesn't make distinct on one column + order by others super easy in one query without a subquery or distinct on.
    // For simplicity v1: Just fetch top 50 attempts and client-side filter for unique users OR just show top runs.
    // Let's show top runs for now.

    const { data: attempts, error } = await supabase
        .from("course_attempts")
        .select(`
      id,
      user_id,
      score,
      time_taken,
      accuracy,
      created_at,
      profiles:user_id (
        full_name,
        username,
        avatar_url
      )
    `)
        .eq("course_id", courseId)
        .eq("day_id", dayId)
        .eq("passed", true) // Only passing runs count?
        .order("score", { ascending: false })
        .order("time_taken", { ascending: true }) // Faster is better
        .limit(20);

    if (error || !attempts) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }

    // Transform data
    return attempts.map((a: any, index) => ({
        rank: index + 1,
        user_id: a.user_id,
        name: a.profiles?.full_name || a.profiles?.username || "Anonymous User",
        avatar_url: a.profiles?.avatar_url,
        score: a.score,
        time_taken: a.time_taken,
        accuracy: a.accuracy,
        created_at: a.created_at,
    }));
}
