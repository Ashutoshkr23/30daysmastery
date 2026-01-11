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

export interface PracticeConfig {
    generator: string;
    questionCount: number;
    passingScore: number;
    timeLimit?: number; // seconds
    config?: any; // Additional generator configuration
}

export interface ConceptItem {
    title: string;
    description: string;
    example: {
        problem: string;
        solution: string;
        steps: string;
    };
    practiceConfig?: PracticeConfig;
}

export interface RoteGroup {
    title: string;
    items: { q: string; a: string }[];
}

export interface RoteContent {
    title: string;
    groups: RoteGroup[];
    practiceConfig?: PracticeConfig;
}

export interface Day {
    id?: string;
    day: number;
    title: string;
    description?: string;
    unlockDate?: string;

    // Structured Content
    content: {
        concept?: ConceptItem | ConceptItem[];
        rote?: RoteContent;
        video?: { youtubeId: string; title: string };
        notes?: { content: string };
    };

    // Legacy/Old structure support (optional, can be removed if unused)
    practice?: { questions: any[] };
    compete?: { targetScore: number; leaderboardId?: string };
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
