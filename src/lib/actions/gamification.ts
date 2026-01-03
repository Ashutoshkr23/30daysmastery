'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addXp(amount: number, source: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch current stats
    const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, level, weekly_xp')
        .eq('id', user.id)
        .single();

    if (!profile) return null;

    const newXp = (profile.total_xp || 0) + amount;
    const newWeeklyXp = (profile.weekly_xp || 0) + amount;

    // Simple leveling curve: Level = sqrt(XP / 100)
    // or typically: XP = Level^2 * 100
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) || 1;

    // Update DB
    const { error } = await supabase
        .from('profiles')
        .update({
            total_xp: newXp,
            weekly_xp: newWeeklyXp,
            level: newLevel,
        })
        .eq('id', user.id);

    if (error) {
        console.error('Error adding XP:', error);
        return null;
    }

    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return {
        newXp,
        newLevel,
        levelUp: newLevel > (profile.level || 1)
    };
}

export async function getLeaderboard(limit = 50) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_xp, level')
        .order('total_xp', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    return data;
}

export async function getBadges(userId: string) {
    const supabase = await createClient();

    // In a real app, this might be a separate table 'user_badges', 
    // but we added a JSONB 'badges' column to profiles for simplicity phase 1.
    const { data, error } = await supabase
        .from('profiles')
        .select('badges')
        .eq('id', userId)
        .single();

    if (error) return [];

    return data.badges || [];
}
