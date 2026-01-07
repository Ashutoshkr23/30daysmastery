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

export interface UnlockedGenerator {
    id: string;
    config?: any;
}

export interface DayConfig {
    id: number;
    title: string;
    linearTasks: TaskConfig[];
    unlockedGenerators: UnlockedGenerator[]; // Generators with their configs
}

// --- Generator Implementation ---

// 1. Single digit + Single digit (1-9 + 1-9)
const gen_add_1d_1d = () => {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    return { operands: [a, b], operator: "+", answer: a + b, type: "ADD_1D_1D" } as Question;
};

// 2. Double digit multiples of 10 (10,20,30...90)
const gen_add_mult10 = () => {
    const a = (Math.floor(Math.random() * 9) + 1) * 10; // 10,20...90
    const b = (Math.floor(Math.random() * 9) + 1) * 10;
    return { operands: [a, b], operator: "+", answer: a + b, type: "ADD_MULT10" } as Question;
};

// 3. Double digit + Double digit (10-99 + 10-99)
const gen_add_2d_2d = () => {
    const a = Math.floor(Math.random() * 90) + 10; // 10-99
    const b = Math.floor(Math.random() * 90) + 10;
    return { operands: [a, b], operator: "+", answer: a + b, type: "ADD_2D_2D" } as Question;
};

// 4. Single digit + Double digit
const gen_add_1d_2d = () => {
    const a = Math.floor(Math.random() * 90) + 10; // 10-99
    const b = Math.floor(Math.random() * 9) + 1;   // 1-9
    return Math.random() > 0.5
        ? { operands: [a, b], operator: "+", answer: a + b, type: "ADD_1D_2D" } as Question
        : { operands: [b, a], operator: "+", answer: a + b, type: "ADD_1D_2D" } as Question;
};

// 5. Complements to 100
const gen_complements_100 = () => {
    const a = Math.floor(Math.random() * 99) + 1;
    const b = 100 - a;
    return { operands: [a, 100], operator: "comp", answer: b, type: "COMPLEMENT_100" } as Question;
};

// 6. Tables (configurable range)
const gen_tables = (config?: { min: number, max: number }) => {
    const min = config?.min || 2;
    const max = config?.max || 12;
    const table = Math.floor(Math.random() * (max - min + 1)) + min;
    const multiplier = Math.floor(Math.random() * 10) + 1;
    return { operands: [table, multiplier], operator: "×", answer: table * multiplier, type: "TABLES" } as Question;
};

// 7. Squares (configurable range)
const gen_squares = (config?: { min: number, max: number }) => {
    const min = config?.min || 2;
    const max = config?.max || 20;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return { operands: [num, 2], operator: "^", answer: num * num, type: "SQUARES" } as Question;
};




// 8. Mirror Numbers (ab + ba)
const gen_add_mirror = () => {
    // Generate distinct digits to ensure it's not a palindrome like 22+22 (though that works, mirrors are usually distinct)
    const x = Math.floor(Math.random() * 9) + 1;
    let y = Math.floor(Math.random() * 9) + 1;
    while (x === y) {
        y = Math.floor(Math.random() * 9) + 1;
    }
    const a = x * 10 + y;
    const b = y * 10 + x;
    return { operands: [a, b], operator: "+", answer: a + b, type: "ADD_MIRROR" } as Question;
};

// 9. Near Doubles (a + b where |a-b| <= 3)
const gen_add_near_doubles = () => {
    const a = Math.floor(Math.random() * 40) + 10; // 10-50 range roughly
    // Difference of -3 to +3, excluding 0
    let diff = Math.floor(Math.random() * 7) - 3;
    if (diff === 0) diff = 1;

    const b = a + diff;
    return { operands: [a, b], operator: "+", answer: a + b, type: "ADD_NEAR_DOUBLES" } as Question;
};


// 10. Subtraction: 2 digit - 1 digit
const gen_sub_2d_1d = () => {
    const a = Math.floor(Math.random() * 90) + 10; // 10-99
    const b = Math.floor(Math.random() * 9) + 1;   // 1-9
    return { operands: [a, b], operator: "-", answer: a - b, type: "SUB_2D_1D" } as Question;
};

// 11. Subtraction: 2 digit - 2 digit (positive result)
const gen_sub_2d_2d = () => {
    const a = Math.floor(Math.random() * 90) + 10; // 10-99
    let b = Math.floor(Math.random() * 90) + 10;   // 10-99

    // Ensure a > b for positive result, swap if needed
    if (b > a) {
        const temp = a;
        // addressing the "const assignment" complaint if I just did a=b.
        // Actually, let's just regenerate b to be smaller or equal to a.
        // Or simpler: just return max - min.
        return { operands: [Math.max(a, b), Math.min(a, b)], operator: "-", answer: Math.max(a, b) - Math.min(a, b), type: "SUB_2D_2D" } as Question;
    }
    return { operands: [a, b], operator: "-", answer: a - b, type: "SUB_2D_2D" } as Question;
};

// 12. Subtraction from multiples of 100 (100, 200... 900)
const gen_sub_from_base = () => {
    const base = (Math.floor(Math.random() * 9) + 1) * 100; // 100, 200... 900
    const sub = Math.floor(Math.random() * 99) + 1; // 1-99
    return { operands: [base, sub], operator: "-", answer: base - sub, type: "SUB_FROM_BASE" } as Question;
};


// --- Generator Registry ---
export const GeneratorRegistry: Record<string, QuestionGenerator> = {
    "ADD_1D_1D": gen_add_1d_1d,
    "ADD_MULT10": gen_add_mult10,
    "ADD_2D_2D": gen_add_2d_2d,
    "ADD_1D_2D": gen_add_1d_2d,
    "COMPLEMENT_100": gen_complements_100,
    "TABLES": gen_tables,
    "SQUARES": gen_squares,
    "ADD_MIRROR": gen_add_mirror,
    "ADD_NEAR_DOUBLES": gen_add_near_doubles,
    "SUB_2D_1D": gen_sub_2d_1d,
    "SUB_2D_2D": gen_sub_2d_2d,
    "SUB_FROM_BASE": gen_sub_from_base,
};

// --- Day Configurations ---

export const daysConfig: Record<number, DayConfig> = {
    1: {
        id: 1,
        title: "Addition Fundamentals & Tables 2-5",
        linearTasks: [
            {
                id: "d1_add_1d",
                title: "Single + Single",
                description: "Add two single digit numbers (1-9).",
                generatorId: "ADD_1D_1D",
                targetCount: 10
            },
            {
                id: "d1_mult10",
                title: "Multiples of 10",
                description: "Add double digits that are multiples of 10.",
                generatorId: "ADD_MULT10",
                targetCount: 10
            },
            {
                id: "d1_add_2d",
                title: "Double + Double",
                description: "Add two double digit numbers.",
                generatorId: "ADD_2D_2D",
                targetCount: 10
            },
            {
                id: "d1_tables",
                title: "Tables 2-5",
                description: "Multiplication tables from 2 to 5.",
                generatorId: "TABLES",
                generatorConfig: { min: 2, max: 5 },
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "ADD_1D_1D" },
            { id: "ADD_MULT10" },
            { id: "ADD_2D_2D" },
            { id: "TABLES", config: { min: 2, max: 5 } }
        ]
    },
    2: {
        id: 2,
        title: "Rapid Addition II & Tables 6-9",
        linearTasks: [
            {
                id: "d2_mirror",
                title: "Mirror Numbers",
                description: "Add mirror numbers (e.g. 23 + 32) using the 11x rule.",
                generatorId: "ADD_MIRROR",
                targetCount: 10
            },
            {
                id: "d2_near_doubles",
                title: "Near Doubles",
                description: "Add numbers close to each other (e.g. 24 + 25) using doubling.",
                generatorId: "ADD_NEAR_DOUBLES",
                targetCount: 10
            },
            {
                id: "d2_tables",
                title: "Tables 6-9",
                description: "Multiplication tables from 6 to 9.",
                generatorId: "TABLES",
                generatorConfig: { min: 6, max: 9 },
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "ADD_MIRROR" },
            { id: "ADD_NEAR_DOUBLES" },
            { id: "TABLES", config: { min: 6, max: 9 } }
        ]
    },
    3: {
        id: 3,
        title: "Subtraction & Tables 10-12",
        linearTasks: [
            {
                id: "d3_sub_2d_1d",
                title: "2-Digit - 1-Digit",
                description: "Simple subtraction.",
                generatorId: "SUB_2D_1D",
                targetCount: 10
            },
            {
                id: "d3_sub_2d_2d",
                title: "2-Digit - 2-Digit",
                description: "Double digit subtraction.",
                generatorId: "SUB_2D_2D",
                targetCount: 10
            },
            {
                id: "d3_sub_base",
                title: "Subtraction from Base",
                description: "Subtract from multiples of 100.",
                generatorId: "SUB_FROM_BASE",
                targetCount: 10
            },
            {
                id: "d3_tables",
                title: "Tables 10-12",
                description: "Multiplication tables 10, 11, 12.",
                generatorId: "TABLES",
                generatorConfig: { min: 10, max: 12 },
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "SUB_2D_1D" },
            { id: "SUB_2D_2D" },
            { id: "SUB_FROM_BASE" },
            { id: "TABLES", config: { min: 10, max: 12 } }
        ]
    }
};

// Helper to get generator
export function getGenerator(id: string) {
    return GeneratorRegistry[id];
}

// Helper to get random generator from a list
export function getRandomGenerator(ids: string[]) {
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    return GeneratorRegistry[randomId];
}

