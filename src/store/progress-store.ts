import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
    completedDays: Record<string, boolean>; // key: "courseId-dayId" -> true
    quizScores: Record<string, number>; // key: "quizId" -> score
    totalXp: number;
    streak: number;
    lastActiveDate: string | null;

    markDayComplete: (courseId: string, dayId: number) => void;
    saveQuizScore: (quizId: string, score: number) => void;
    updateStreak: () => void;
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            completedDays: {},
            quizScores: {},
            totalXp: 0,
            streak: 0,
            lastActiveDate: null,

            markDayComplete: (courseId, dayId) => {
                const key = `${courseId}-${dayId}`;
                const { completedDays, updateStreak } = get();

                if (!completedDays[key]) {
                    set((state) => ({
                        completedDays: { ...state.completedDays, [key]: true },
                        totalXp: state.totalXp + 50, // 50 XP per day completion
                    }));
                    updateStreak();
                }
            },

            saveQuizScore: (quizId, score) => {
                set((state) => ({
                    quizScores: { ...state.quizScores, [quizId]: score },
                    totalXp: state.totalXp + (score * 10), // 10 XP per point
                }));
                get().updateStreak();
            },

            updateStreak: () => {
                const today = new Date().toISOString().split('T')[0];
                const { lastActiveDate, streak } = get();

                if (lastActiveDate !== today) {
                    // Check if yesterday was active to maintain streak
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastActiveDate === yesterdayStr) {
                        set({ streak: streak + 1, lastActiveDate: today });
                    } else if (lastActiveDate !== today) {
                        // Reset if gap > 1 day (unless first day)
                        set({ streak: 1, lastActiveDate: today });
                    }
                }
            },
        }),
        {
            name: '30-days-mastery-progress',
        }
    )
);
