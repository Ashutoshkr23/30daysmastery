// Define the structure for our data
export type Question = {
    operands: [number, number];
    operator: string;
    answer: number;
};

export type QuestionGenerator = () => Question;

export type StarRating = {
    pro: { maxTime: number; label: string };
    threeStar: { maxTime: number };
    twoStar: { maxTime: number };
    oneStar: { minTime: number };
};

export type Task = {
    name: string;
    generator: QuestionGenerator;
};

export type ChallengeDay = {
    heading: string;
    tasks: Task[];
    starRating: StarRating;
};

// --- Generator Functions ---

// Day 1 Generators
export const singleDigitAdd: QuestionGenerator = () => {
    const a = Math.floor(Math.random() * 7 + 3); // 3-9
    const b = Math.floor(Math.random() * 7 + 3); // 3-9
    return { operands: [a, b], operator: "+", answer: a + b };
};

export const tensAdd: QuestionGenerator = () => {
    const a = (Math.floor(Math.random() * 9) + 1) * 10; // 10, 20...90
    const b = (Math.floor(Math.random() * 9) + 1) * 10; // 10, 20...90
    return { operands: [a, b], operator: "+", answer: a + b };
};

export const twoDigitAdd: QuestionGenerator = () => {
    const a = Math.floor(Math.random() * 90 + 10); // 10-99
    const b = Math.floor(Math.random() * 90 + 10); // 10-99
    return { operands: [a, b], operator: "+", answer: a + b };
};

// Day 2 Generators
export const threeDigitTensAddWithTwoDigit: QuestionGenerator = () => {
    const a = (Math.floor(Math.random() * 90) + 10) * 10; // 100, 110 ... 990
    const b = Math.floor(Math.random() * 90 + 10);      // 10-99
    return { operands: [a, b], operator: "+", answer: a + b };
};

export const threeDigitAdd: QuestionGenerator = () => {
    const a = Math.floor(Math.random() * 900 + 100); // 100-999
    const b = Math.floor(Math.random() * 900 + 100); // 100-999
    return { operands: [a, b], operator: "+", answer: a + b };
};

export const nearMultipleOf100Add: QuestionGenerator = () => {
    const a = Math.floor(Math.random() * 900 + 100); // 100-999
    const base = (Math.floor(Math.random() * 8) + 2) * 100; // 200, 300...900
    const offset = Math.floor(Math.random() * 5) - 2;        // -2, -1, 0, 1, 2
    const b = base + offset;
    return { operands: [a, b], operator: "+", answer: a + b };
};

// Day 3 Generators
export const closeToMultipleOf100PlusTwoOrThreeDigit: QuestionGenerator = () => {
    const base = (Math.floor(Math.random() * 8) + 2) * 100; // 200-900
    const offset = Math.floor(Math.random() * 5) - 2;       // -2 to 2
    const a = base + offset;
    const b = Math.random() < 0.5
        ? Math.floor(Math.random() * 90 + 10)                // 10-99
        : Math.floor(Math.random() * 900 + 100);             // 100-999
    return { operands: [a, b], operator: "+", answer: a + b };
};

export const closeNumbersDiffLessThan20: QuestionGenerator = () => {
    const a = Math.floor(Math.random() * 980 + 20);           // 20-999
    let diff = Math.floor(Math.random() * 39) - 19;            // -19 to 19
    if (diff === 0) diff = 1;
    const b = a + diff;
    return { operands: [a, b], operator: "+", answer: a + b };
};

export const xyYxAdd: QuestionGenerator = () => {
    const x = Math.floor(Math.random() * 9) + 1;              // 1-9
    let y = Math.floor(Math.random() * 10);                   // 0-9
    while (y === x) y = Math.floor(Math.random() * 10);
    const a = x * 10 + y;
    const b = y * 10 + x;
    return { operands: [a, b], operator: "+", answer: a + b };
};

// Day 4 Generators (Subtraction)
export const twoDigitMinusOneDigit: QuestionGenerator = () => {
    const a = Math.floor(Math.random() * 90 + 10); // 10-99
    const b = Math.floor(Math.random() * 9 + 1);   // 1-9
    return { operands: [a, b], operator: "-", answer: a - b };
};

export const twoDigitMinusTwoDigitNoBorrow: QuestionGenerator = () => {
    const tensA = Math.floor(Math.random() * 9) + 1;
    const unitsA = Math.floor(Math.random() * 10);
    const tensB = Math.floor(Math.random() * (tensA + 1));
    const unitsB = Math.floor(Math.random() * (unitsA + 1));
    const a = tensA * 10 + unitsA;
    const b = tensB * 10 + unitsB;
    return { operands: [a, b], operator: "-", answer: a - b };
};

export const twoDigitMinusTwoDigitWithBorrow: QuestionGenerator = () => {
    const tensA = Math.floor(Math.random() * 9) + 1;
    const unitsA = Math.floor(Math.random() * 9); // 0-8 to allow borrow
    const tensB = Math.floor(Math.random() * tensA);
    const unitsB = Math.floor(Math.random() * (9 - unitsA)) + unitsA + 1; // > unitsA
    const a = tensA * 10 + unitsA;
    const b = tensB * 10 + unitsB;
    return { operands: [a, b], operator: "-", answer: a - b };
};

// Day 5 Generators (Subtraction)
export const threeDigitSubtractNoBorrow: QuestionGenerator = () => {
    const aHundreds = Math.floor(Math.random() * 9) + 1;
    const aTens = Math.floor(Math.random() * 10);
    const aUnits = Math.floor(Math.random() * 10);
    const bHundreds = Math.floor(Math.random() * (aHundreds + 1));
    const bTens = Math.floor(Math.random() * (aTens + 1));
    const bUnits = Math.floor(Math.random() * (aUnits + 1));
    const a = aHundreds * 100 + aTens * 10 + aUnits;
    const b = bHundreds * 100 + bTens * 10 + bUnits;
    return { operands: [a, b], operator: "-", answer: a - b };
};

export const threeDigitSubtractWithBorrow: QuestionGenerator = () => {
    const aHundreds = Math.floor(Math.random() * 9) + 1;
    const aTens = Math.floor(Math.random() * 10);
    const aUnits = Math.floor(Math.random() * 9); // 0-8 for borrow
    const hundredsB = Math.floor(Math.random() * aHundreds);
    const tensB = Math.floor(Math.random() * 10);
    const unitsB = Math.floor(Math.random() * (9 - aUnits)) + aUnits + 1; // > aUnits
    const a = aHundreds * 100 + aTens * 10 + aUnits;
    const b = hundredsB * 100 + tensB * 10 + unitsB;
    return { operands: [a, b], operator: "-", answer: a - b };
};

export const abcCbaSubtract: QuestionGenerator = () => {
    const x = Math.floor(Math.random() * 9) + 1;
    const z = Math.floor(Math.random() * x);
    const y = Math.floor(Math.random() * 10);
    const a = x * 100 + y * 10 + z;
    const b = z * 100 + y * 10 + x;
    return { operands: [a, b], operator: "-", answer: a - b };
};

export const xyYxSubtract: QuestionGenerator = () => {
    const x = Math.floor(Math.random() * 9) + 1;
    let y = Math.floor(Math.random() * 9) + 1;
    while (y === x) {
        y = Math.floor(Math.random() * 9) + 1;
    }
    const a = x * 10 + y;
    const b = y * 10 + x;
    const first = Math.max(a, b);
    const second = Math.min(a, b);
    return {
        operands: [first, second],
        operator: "-",
        answer: first - second
    };
};

// Tables
const createTableGenerator = (minTable: number, maxTable: number): QuestionGenerator => {
    return () => {
        const base = Math.floor(Math.random() * (maxTable - minTable + 1)) + minTable;
        const multiplier = Math.floor(Math.random() * 10) + 1; // 1–10
        return { operands: [base, multiplier], operator: "*", answer: base * multiplier };
    };
};

export const table1to4 = createTableGenerator(1, 4);
export const table5to6 = createTableGenerator(5, 6);
export const table7to8 = createTableGenerator(7, 8);
export const table9to10 = createTableGenerator(9, 10);
export const table11to12 = createTableGenerator(11, 12);
export const table13to14 = createTableGenerator(13, 14);
export const table15to16 = createTableGenerator(15, 16);
export const table17to18 = createTableGenerator(17, 18);
export const table19to20 = createTableGenerator(19, 20);
export const table21to22 = createTableGenerator(21, 22);
export const table23to24 = createTableGenerator(23, 24);
export const table25to26 = createTableGenerator(25, 26);

// --- Config ---
const tableStarRating: StarRating = {
    pro: { maxTime: 20, label: "Pro" },
    threeStar: { maxTime: 25 },
    twoStar: { maxTime: 30 },
    oneStar: { minTime: 30 },
};

export const challengeConfig: Record<number, ChallengeDay> = {
    1: {
        heading: "Addition of 2 Digits",
        starRating: {
            pro: { maxTime: 20, label: "Pro" },
            threeStar: { maxTime: 25 },
            twoStar: { maxTime: 30 },
            oneStar: { minTime: 30 },
        },
        tasks: [
            { name: "Single Digits", generator: singleDigitAdd },
            { name: "Multiples of 10", generator: tensAdd },
            { name: "Double Digits", generator: twoDigitAdd },
        ],
    },
    2: {
        heading: "Addition Day 2",
        starRating: {
            pro: { maxTime: 20, label: "Pro" },
            threeStar: { maxTime: 25 },
            twoStar: { maxTime: 30 },
            oneStar: { minTime: 30 },
        },
        tasks: [
            { name: "Three Digit (x10) + Two Digit", generator: threeDigitTensAddWithTwoDigit },
            { name: "Three Digit + Three Digit", generator: threeDigitAdd },
            { name: "Near a Multiple of 100", generator: nearMultipleOf100Add },
        ],
    },
    // ... (Add other days as needed)
};
