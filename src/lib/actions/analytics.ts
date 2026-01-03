'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAnalyticsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Heatmap Data (Activity over last 365 days)
    // We'll use 'daily_progress' created_at dates
    const { data: activityData } = await supabase
        .from('daily_progress')
        .select('created_at, compete_score')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    const heatmap: Record<string, number> = {};
    activityData?.forEach(entry => {
        const date = entry.created_at.split('T')[0];
        heatmap[date] = (heatmap[date] || 0) + 1; // Count activity
    });

    // 2. Radar Data (Skills Aggregation)
    // Assuming 'course_id' maps to skills for now, or we define a mapping
    // Hardcoding categories based on current course structures for demo
    const { data: skillsData } = await supabase
        .from('daily_progress')
        .select('course_id, practice_score, compete_score')
        .eq('user_id', user.id);

    // Aggregate scores by category
    const skills: Record<string, { total: number; count: number }> = {
        "Speed": { total: 0, count: 0 },
        "Accuracy": { total: 0, count: 0 },
        "Logic": { total: 0, count: 0 },
        "Memory": { total: 0, count: 0 },
        "Focus": { total: 0, count: 0 },
    };

    // Mock distribution logic (since we only have 'speed-maths' mostly)
    skillsData?.forEach(att => {
        const score = Math.max(att.practice_score || 0, att.compete_score || 0);

        // Distribute points to categories based on "course_id" or random for demo
        // In real app, this would be strictly defined
        skills["Speed"].total += score;
        skills["Speed"].count++;

        skills["Accuracy"].total += (score > 80 ? score : score * 0.8);
        skills["Accuracy"].count++;

        if (att.course_id === 'speed-maths') {
            skills["Logic"].total += score * 0.9;
            skills["Logic"].count++;
        }
    });

    // Calculate averages (0-100) or defaults
    const radarData = Object.keys(skills).map(key => ({
        subject: key,
        value: skills[key].count > 0 ? Math.round(skills[key].total / skills[key].count) : 40 // Default base stat
    }));

    return {
        heatmap,
        radarData
    };
}
