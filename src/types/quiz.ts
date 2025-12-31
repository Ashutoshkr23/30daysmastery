export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface Quiz {
    id: string;
    title: string;
    description?: string;
    timeLimitMinutes: number; // 0 for no limit
    questions: Question[];
}
