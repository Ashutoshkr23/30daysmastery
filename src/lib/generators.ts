// --- Types ---

export type Question = {
    operands: [number, number];
    operator: string;
    answer: number;
    type?: string;
};

export type QuestionGenerator = (config?: any) => Question;

export type TaskId = string;

export interface TaskConfig {
    id: TaskId;
    title: string;
    description: string;
    generatorId: string;
    generatorConfig?: any;
    targetCount: number; // Number of questions to complete in Linear Mode
}

export interface DayConfig {
    id: number;
    title: string;
    linearTasks: TaskConfig[];
    unlockedGenerators: string[]; // IDs of generators available in Custom Mode after completion
}

// --- Generator Implementation ---

// 1. Core Generators
const gen_add_1d_1d = () => {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    return { operands: [a, b], operator: "+", answer: a + b, type: "ADD_1D_1D" } as Question;
};

const gen_add_1d_2d = () => {
    const a = Math.floor(Math.random() * 90) + 10; // 10-99
    const b = Math.floor(Math.random() * 9) + 1;   // 1-9
    // Randomize order
    return Math.random() > 0.5
        ? { operands: [a, b], operator: "+", answer: a + b, type: "ADD_1D_2D" } as Question
        : { operands: [b, a], operator: "+", answer: a + b, type: "ADD_1D_2D" } as Question;
};

const gen_complements_100 = () => {
    const a = Math.floor(Math.random() * 99) + 1;
    const b = 100 - a;
    return { operands: [a, 100], operator: "comp", answer: b, type: "COMPLEMENT_100" } as Question;
    // NOTE: UI should handle 'comp' operator to show "Complement of {a} to 100"
};

const gen_tables = (config?: { min: number, max: number }) => {
    const min = config?.min || 2;
    const max = config?.max || 12;
    const table = Math.floor(Math.random() * (max - min + 1)) + min;
    const multiplier = Math.floor(Math.random() * 10) + 1;
    return { operands: [table, multiplier], operator: "×", answer: table * multiplier, type: "TABLES" } as Question;
};

const gen_squares = (config?: { min: number, max: number }) => {
    const min = config?.min || 2;
    const max = config?.max || 20;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return { operands: [num, 2], operator: "^", answer: num * num, type: "SQUARES" } as Question;
};


// 2. Registry
export const GeneratorRegistry: Record<string, QuestionGenerator> = {
    "ADD_1D_1D": gen_add_1d_1d,
    "ADD_1D_2D": gen_add_1d_2d,
    "COMPLEMENT_100": gen_complements_100,
    "TABLES": gen_tables,
    "SQUARES": gen_squares,
};

// --- Day Configurations (The Linear Path) ---

export const daysConfig: Record<number, DayConfig> = {
    1: {
        id: 1,
        title: "Speed Addition & Tables",
        unlockedGenerators: ["ADD_1D_1D", "ADD_1D_2D", "TABLES", "SQUARES", "COMPLEMENT_100"],
        linearTasks: [
            {
                id: "d1_t1",
                title: "Warmup: Single Digits",
                description: "Add two single digit numbers as fast as possible.",
                generatorId: "ADD_1D_1D",
                targetCount: 10
            },
            {
                id: "d1_t2",
                title: "Core: Single + Double",
                description: "Add a single digit to a double digit number.",
                generatorId: "ADD_1D_2D",
                targetCount: 15
            },
            {
                id: "d1_t3",
                title: "Vitamin: Tables (2-12)",
                description: "Basic multiplication tables.",
                generatorId: "TABLES",
                generatorConfig: { min: 2, max: 12 },
                targetCount: 15
            },
            {
                id: "d1_t4",
                title: "Complements to 100",
                description: "Find the missing piece to make 100.",
                generatorId: "COMPLEMENT_100",
                targetCount: 10
            }
        ]
    }
};

// Helper to get generator
export function getGenerator(id: string) {
    return GeneratorRegistry[id];
}
