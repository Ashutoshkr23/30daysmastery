export type ModuleType = 'video' | 'note' | 'quiz' | 'mock';

export interface Module {
    id: string;
    type: ModuleType;
    title: string;
    duration?: string; // e.g. "10 min"
    isCompleted: boolean;
    content: {
        videoUrl?: string; // For video modules
        markdownContent?: string; // For note modules
        questionCount?: number; // For quiz/mock modules
        quizId?: string;
    };
}

export interface Day {
    id: string;
    dayNumber: number;
    title: string;
    description: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    modules: Module[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    totalDays: number;
    progress: number; // 0-100
    days: Day[];
}
