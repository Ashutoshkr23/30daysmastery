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
        return { success: true };
    }
}

export async function getRecentAttempts(courseId: string, dayId: number) {
    console.log("getRecentAttempts called:", { courseId, dayId });
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.warn("getRecentAttempts: No user");
        return [];
    }

    const { data, error } = await supabase
        .from("course_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("day_id", dayId)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching attempts:", error);
        return [];
    }

    return data;
}
