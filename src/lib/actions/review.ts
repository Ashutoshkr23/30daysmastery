"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ReviewCard = {
    id: number;
    user_id: string;
    course_id: string;
    card_id: string;
    front: string;
    back: string;
    created_at: string; // ISO date string
};

export async function toggleReviewCard(data: {
    courseId: string;
    cardId: string;
    front: string;
    back: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if exists
    const { data: existing } = await supabase
        .from("flashcard_reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", data.courseId)
        .eq("card_id", data.cardId)
        .single();

    if (existing) {
        // Remove
        await supabase.from("flashcard_reviews").delete().eq("id", existing.id);
        revalidatePath("/review");
        return { isBookmarked: false };
    } else {
        // Add
        await supabase.from("flashcard_reviews").insert({
            user_id: user.id,
            course_id: data.courseId,
            card_id: data.cardId,
            front: data.front,
            back: data.back,
        });
        revalidatePath("/review");
        return { isBookmarked: true };
    }
}

export async function getReviewCards() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("flashcard_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching review cards:", error);
        return [];
    }

    return data as ReviewCard[];
}

export async function getReviewStatus(courseId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("flashcard_reviews")
        .select("card_id")
        .eq("user_id", user.id)
        .eq("course_id", courseId);

    if (error) return [];

    return data.map(d => d.card_id);
}
