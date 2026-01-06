"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DailyProgressUpdate = {
    video_watched?: boolean;
    notes_read?: boolean;
    practice_score?: number;
    compete_score?: number;
};

export async function updateDailyProgress(
    courseId: string,
    dayId: number,
    data: DailyProgressUpdate
) {
    console.log("updateDailyProgress called:", { courseId, dayId, data });
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.error("updateDailyProgress: Unauthorized");
        throw new Error("Unauthorized");
    }

    // Check if row exists, if not create it
    // We use upsert to handle both insert and update
    const { error } = await supabase
        .from("daily_progress")
        .upsert(
            {
                user_id: user.id,
                course_id: courseId,
                day_id: dayId,
                updated_at: new Date().toISOString(),
                ...data,
            },
            { onConflict: "user_id, course_id, day_id" }
        );

    if (error) {
        console.error("Error updating progress:", error);
        throw new Error("Failed to update progress");
    }

    console.log("updateDailyProgress success");
    revalidatePath(`/courses/${courseId}/day/${dayId}`);
    return { success: true };
}

export async function getDailyProgress(courseId: string, dayId: number) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("day_id", dayId)
        .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is "Row not found"
        console.error("Error fetching progress:", error);
    }

    // console.log("getDailyProgress result:", data);
    return data;
}

// --- ATTEMPT LOGGING ---

export type AttemptLog = {
    course_id: string;
    day_id: number;
    task_id?: string; // New field
    score: number;
    total_questions: number;
    accuracy: number;
    time_taken: number;
    passed: boolean;
};

export async function logAttempt(data: AttemptLog) {
    console.log("logAttempt called:", data);
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("course_attempts").insert({
        user_id: user.id,
        ...data,
    });

    if (error) {
        console.error("Error logging attempt:", error);
        return { success: false, error: error.message };
    } else {
        console.log("logAttempt success");
        revalidatePath(`/courses/${data.course_id}/day/${data.day_id}`);
        return { success: true };
    }
}

export async function getRecentAttempts(courseId: string, dayId: number, taskId?: string) {
    console.log("getRecentAttempts called:", { courseId, dayId, taskId });
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.warn("getRecentAttempts: No user");
        return [];
    }

    let query = supabase
        .from("course_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("day_id", dayId)
        .order("created_at", { ascending: false }); // Latest first

    if (taskId) {
        query = query.eq("task_id", taskId);
    }

    // Increase limit to capture enough history for unlock checks
    const { data, error } = await query.limit(50);

    if (error) {
        console.error("Error fetching attempts:", error);
        return [];
    }

    return data;
}

export async function getCompletedTasks(courseId: string, dayId: number) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Fetch all PASSED attempts for this day, selecting only task_id
    const { data, error } = await supabase
        .from("course_attempts")
        .select("task_id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("day_id", dayId)
        .eq("passed", true);

    if (error) {
        console.error("Error fetching completed tasks:", error);
        return [];
    }

    // Return unique task IDs
    const uniqueIds = Array.from(new Set(data.map(d => d.task_id).filter(Boolean)));
    return uniqueIds as string[];
}

/**
 * Get user's overall course progress as a percentage (0-100).
 * Progress is based on how many days have been completed (notes_read or practice_score > 0).
 */
export async function getCourseProgress(courseId: string, totalDays: number = 30) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    // Get all daily_progress entries for this course
    const { data, error } = await supabase
        .from("daily_progress")
        .select("day_id, notes_read, practice_score")
        .eq("user_id", user.id)
        .eq("course_id", courseId);

    if (error) {
        console.error("Error fetching course progress:", error);
        return 0;
    }

    // Count days where user has made meaningful progress
    const completedDays = data?.filter(d => d.notes_read || (d.practice_score && d.practice_score > 0)).length || 0;

    return Math.round((completedDays / totalDays) * 100);
}

/**
 * Get last active day info to show on the "Continue Learning" card.
 * Returns the highest day_id with progress, or day 1 if no progress yet.
 */
export async function getLastActiveDay(courseId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { dayId: 1, completionPercent: 0 };

    // Get the user's most recent progress for this course
    const { data, error } = await supabase
        .from("daily_progress")
        .select("day_id, notes_read, practice_score, compete_score, updated_at")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .order("updated_at", { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        return { dayId: 1, completionPercent: 0 };
    }

    const lastDay = data[0];

    // Calculate day completion percentage
    // Notes = 33%, Practice = 33%, Compete = 34%
    let completionPercent = 0;
    if (lastDay.notes_read) completionPercent += 33;
    if (lastDay.practice_score && lastDay.practice_score > 0) completionPercent += 33;
    if (lastDay.compete_score && lastDay.compete_score > 0) completionPercent += 34;

    return { dayId: lastDay.day_id, completionPercent };
}
