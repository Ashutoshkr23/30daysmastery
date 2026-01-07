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


// 13. Subtraction: Numbers close to 100 (85-115)
const gen_sub_close_100 = () => {
    // Generate two numbers near 100
    const a = Math.floor(Math.random() * 31) + 85; // 85-115
    let b = Math.floor(Math.random() * 31) + 85;   // 85-115

    // Ensure distinct and a > b for simple subtraction context
    while (a === b) {
        b = Math.floor(Math.random() * 31) + 85;
    }

    return {
        operands: [Math.max(a, b), Math.min(a, b)],
        operator: "-",
        answer: Math.abs(a - b),
        type: "SUB_CLOSE_100"
    } as Question;
};


// 14. Multiply by 5
const gen_mult_5 = () => {
    // Generate even numbers often for easier "half" step, but can be odd too
    const a = Math.floor(Math.random() * 90) + 10; // 10-99
    return {
        operands: [a, 5],
        operator: "×",
        answer: a * 5,
        type: "MULT_5"
    } as Question;
};

// 15. Multiply by 50
const gen_mult_50 = () => {
    const a = Math.floor(Math.random() * 90) + 10; // 10-99
    return {
        operands: [a, 50],
        operator: "×",
        answer: a * 50,
        type: "MULT_50"
    } as Question;
};

// 16. Multiply by 0.5
const gen_mult_0_5 = () => {
    // Even numbers preferred for integer results
    const a = (Math.floor(Math.random() * 45) + 5) * 2; // 10-98 even
    return {
        operands: [a, 0.5],
        operator: "×",
        answer: a * 0.5,
        type: "MULT_0_5"
    } as Question;
};

// 17. Even Number x Number ending in 5
const gen_even_x_ends_5 = () => {
    // Even number: 2-24 (small enough to be manageable after halving)
    const even = (Math.floor(Math.random() * 12) + 1) * 2;
    // Number ending in 5: 5, 15, 25, 35, 45, 55...
    const ends5 = (Math.floor(Math.random() * 10) * 10) + 5;

    return {
        operands: [even, ends5],
        operator: "×",
        answer: even * ends5,
        type: "EVEN_X_ENDS_5"
    } as Question;
};


// 18. Multiply by 25
const gen_mult_25 = () => {
    // Ideally numbers divisible by 4 for integers, but trick works regardless
    const a = Math.floor(Math.random() * 80) + 4; // 4-84
    return {
        operands: [a, 25],
        operator: "×",
        answer: a * 25,
        type: "MULT_25"
    } as Question;
};

// 19. Multiply by 125
const gen_mult_125 = () => {
    // Numbers divisible by 8 preferred for clean start but random is fine too
    const a = (Math.floor(Math.random() * 20) + 1) * 2; // smallish even numbers
    return {
        operands: [a, 125],
        operator: "×",
        answer: a * 125,
        type: "MULT_125"
    } as Question;
};

// 20. Multiply by Decimals (0.25, 1.25, 12.5)
const gen_decimals_25 = () => {
    const decimals = [0.25, 1.25, 12.5];
    const decimal = decimals[Math.floor(Math.random() * decimals.length)];

    // Choose operand divisible by 4 for cleaner results usually
    const a = (Math.floor(Math.random() * 24) + 1) * 4;

    return {
        operands: [a, decimal],
        operator: "×",
        answer: a * decimal,
        type: "MULT_DECIMALS_25"
    } as Question;
};


// 21. Div by 5, 50, 0.5
const gen_div_5 = () => {
    const type = Math.random();
    if (type < 0.33) {
        // Divide by 5 (Mult by 2, div 10)
        // Pick number where doubling doesn't necessarily result in integer, but let's keep it simple-ish or 1 decimal.
        const a = Math.floor(Math.random() * 900) + 10;
        return { operands: [a, 5], operator: "÷", answer: a / 5, type: "DIV_5" } as Question;
    } else if (type < 0.66) {
        // Divide by 50 (Mult by 2, div 100)
        const a = (Math.floor(Math.random() * 90) + 10) * 10; // Multiples of 10 for cleaner results
        return { operands: [a, 50], operator: "÷", answer: a / 50, type: "DIV_50" } as Question;
    } else {
        // Divide by 0.5 (Mult by 2)
        const a = Math.floor(Math.random() * 90) + 10;
        return { operands: [a, 0.5], operator: "÷", answer: a / 0.5, type: "DIV_0_5" } as Question;
    }
};

// 22. Div by 25, 0.25
const gen_div_25 = () => {
    if (Math.random() > 0.5) {
        // Divide by 25 (Mult by 4, div 100)
        // Use multiples of 25 for integers
        const a = (Math.floor(Math.random() * 40) + 1) * 25;
        return { operands: [a, 25], operator: "÷", answer: a / 25, type: "DIV_25" } as Question;
    } else {
        // Divide by 0.25 (Mult by 4)
        const a = Math.floor(Math.random() * 50) + 4;
        return { operands: [a, 0.25], operator: "÷", answer: a / 0.25, type: "DIV_0_25" } as Question;
    }
};

// 23. Div by 125, 0.125
const gen_div_125 = () => {
    if (Math.random() > 0.5) {
        // Divide by 125 (Mult by 8, div 1000)
        // Multiples of 125
        const a = (Math.floor(Math.random() * 40) + 1) * 125;
        return { operands: [a, 125], operator: "÷", answer: a / 125, type: "DIV_125" } as Question;
    } else {
        // Divide by 0.125 (Mult by 8)
        const a = Math.floor(Math.random() * 20) + 2;
        return { operands: [a, 0.125], operator: "÷", answer: a / 0.125, type: "DIV_0_125" } as Question;
    }
};


// 24. Multiply by 11
const gen_mult_11 = () => {
    // 2-digit number x 11
    const a = Math.floor(Math.random() * 90) + 10;
    return { operands: [a, 11], operator: "×", answer: a * 11, type: "MULT_11" } as Question;
};

// 25. Multiply by 101, 1001
const gen_mult_101 = () => {
    if (Math.random() > 0.5) {
        // 2-digit x 101 = abab
        const a = Math.floor(Math.random() * 90) + 10;
        return { operands: [a, 101], operator: "×", answer: a * 101, type: "MULT_101" } as Question;
    } else {
        // 3-digit x 1001 = abcabc
        const a = Math.floor(Math.random() * 900) + 100;
        return { operands: [a, 1001], operator: "×", answer: a * 1001, type: "MULT_1001" } as Question;
    }
};

// 26. Repeating Numbers (22, 33...) x Single Digit
const gen_mult_repeating_1d = () => {
    const digit = Math.floor(Math.random() * 9) + 1; // 1-9
    const repeating = digit * 11; // 11, 22... 99

    // Multiplier 2-9
    const multiplier = Math.floor(Math.random() * 8) + 2;

    return {
        operands: [repeating, multiplier],
        operator: "×",
        answer: repeating * multiplier,
        type: "MULT_REPEATING_1D"
    } as Question;
};


// 27. Multiply by 9, 99, 999 (Base complement)
const gen_mult_9 = () => {
    const a = Math.floor(Math.random() * 90) + 10;
    return { operands: [a, 9], operator: "×", answer: a * 9, type: "MULT_9" } as Question;
};

const gen_mult_99 = () => {
    const a = Math.floor(Math.random() * 90) + 10; // 2 digit usually for the trick
    return { operands: [a, 99], operator: "×", answer: a * 99, type: "MULT_99" } as Question;
};

const gen_mult_999 = () => {
    const a = Math.floor(Math.random() * 900) + 100; // 3 digit usually
    return { operands: [a, 999], operator: "×", answer: a * 999, type: "MULT_999" } as Question;
};


// 28. Digital Sum (Casting Out Nines)
const gen_digital_sum = () => {
    const a = Math.floor(Math.random() * 9000) + 100; // 3-4 digit number

    const getDigitalSum = (n: number): number => {
        if (n === 0) return 0;
        return (n % 9 === 0) ? 9 : (n % 9);
    };

    return {
        operands: [a, 0], // Only one operand really matters
        operator: "DS",
        answer: getDigitalSum(a),
        type: "DIGITAL_SUM"
    } as Question;
};

// 29. Product of n(n+1)
const gen_n_n_plus_1 = () => {
    const n = Math.floor(Math.random() * 20) + 11; // 11 to 30 ish
    return {
        operands: [n, n + 1],
        operator: "×",
        answer: n * (n + 1),
        type: "MULT_N_N_PLUS_1"
    } as Question;
};


// 30. 37 x 3, 6, 9... (The 111 Trick)
const gen_mult_37_3n = () => {
    const k = Math.floor(Math.random() * 9) + 1; // 1 to 9
    const multiplier = k * 3; // 3, 6, 9 ... 27
    return {
        operands: [37, multiplier],
        operator: "×",
        answer: 37 * multiplier,
        type: "MULT_37_3N"
    } as Question;
};

// 31. 16, 166, 1666... x 4
const gen_mult_16_series_4 = () => {
    // Generate n number of 6s after 1. 
    const n = Math.floor(Math.random() * 3) + 1; // 1 to 3 usually (16, 166, 1666)
    const str = "1" + "6".repeat(n);
    const val = parseInt(str);

    return {
        operands: [val, 4],
        operator: "×",
        answer: val * 4,
        type: "MULT_16_SERIES_4"
    } as Question;
};

// 32. Two numbers ending in 1 (31x41)
const gen_mult_units_1 = () => {
    // Generate two 2-digit numbers ending in 1
    const a = (Math.floor(Math.random() * 9) + 1) * 10 + 1; // 11, 21... 91
    const b = (Math.floor(Math.random() * 9) + 1) * 10 + 1;

    return {
        operands: [a, b],
        operator: "×",
        answer: a * b,
        type: "MULT_UNITS_1"
    } as Question;
};

// 33. Two 3-digit numbers with 0 in middle (305x406)
const gen_mult_3d_middle_0 = () => {
    const a = (Math.floor(Math.random() * 9) + 1) * 100 + (Math.floor(Math.random() * 9) + 1); // 101 to 909 (no middle digit)
    const b = (Math.floor(Math.random() * 9) + 1) * 100 + (Math.floor(Math.random() * 9) + 1);

    return {
        operands: [a, b],
        operator: "×",
        answer: a * b,
        type: "MULT_3D_MIDDLE_0"
    } as Question;
};

// 34. Consecutive Even/Odd (n^2 - 1)
const gen_mult_consecutive_even_odd = () => {
    const n = Math.floor(Math.random() * 30) + 10; // Middle number 10 to 40
    // Make sure middle number is valid so n-1 and n+1 are both odd or both even
    // Actually n can be anything. (n-1)(n+1) = n^2 - 1.
    // Neighbors are n-1 and n+1.

    return {
        operands: [n - 1, n + 1],
        operator: "×",
        answer: (n - 1) * (n + 1),
        type: "MULT_CONSECUTIVE_EVEN_ODD"
    } as Question;
};

// 35. Multiply by 1.5 (Number + Half)
const gen_mult_1_5 = () => {
    // Even numbers are easier, odd numbers involve .5
    const val = Math.floor(Math.random() * 40) + 10; // 10 to 50
    return {
        operands: [val, 1.5],
        operator: "×",
        answer: val * 1.5,
        type: "MULT_1_5"
    } as Question;
};

// 36. Multiply by 15 (Number + Half, then x10)
const gen_mult_15 = () => {
    const val = Math.floor(Math.random() * 40) + 10; // 10 to 50
    return {
        operands: [val, 15],
        operator: "×",
        answer: val * 15,
        type: "MULT_15"
    } as Question;
};

// 37. Multiply by 2.5 (Double + Half)
const gen_mult_2_5 = () => {
    // Integers for easier calculation initially
    const val = (Math.floor(Math.random() * 20) + 4) * 2; // Even numbers 8 to 48
    return {
        operands: [val, 2.5],
        operator: "×",
        answer: val * 2.5,
        type: "MULT_2_5"
    } as Question;
};

// 38. General 2x2 Multiplication (Criss-Cross)
const gen_mult_criss_cross = () => {
    // Random 2-digit numbers, avoiding trivial ones (like x10)
    const a = Math.floor(Math.random() * 80) + 11; // 11 to 90
    const b = Math.floor(Math.random() * 80) + 11;
    return {
        operands: [a, b],
        operator: "×",
        answer: a * b,
        type: "MULT_CRISS_CROSS"
    } as Question;
};

// 39. Product Partition (Split & Multiply) - 2D x 1D
const gen_mult_split = () => {
    // E.g. 42 x 7 -> (40+2)x7
    const a = Math.floor(Math.random() * 80) + 12; // 12 to 91
    const b = Math.floor(Math.random() * 7) + 3;  // 3 to 9 (single digit)
    return {
        operands: [a, b],
        operator: "×",
        answer: a * b,
        type: "MULT_SPLIT"
    } as Question;
};


// 40. Square of numbers ending in 5 (2-digit)
const gen_square_ends_5 = () => {
    // 15, 25, ... 95
    const tens = Math.floor(Math.random() * 9) + 1; // 1-9
    const val = tens * 10 + 5;
    return {
        operands: [val],
        operator: "sq",
        answer: val * val,
        type: "SQUARE_ENDS_5"
    } as unknown as Question;
};

// 41. Square of 3-digit numbers ending in 5
const gen_square_ends_5_3d = () => {
    // 105, 115, ... 195 (or larger, but basic n(n+1) is good for low 3 digits)
    const tens = Math.floor(Math.random() * 10) + 10; // 10-19 (for 105-195)
    const val = tens * 10 + 5;
    return {
        operands: [val],
        operator: "sq",
        answer: val * val,
        type: "SQUARE_ENDS_5_3D"
    } as unknown as Question;
};

// 42. Squares numbers between 50 and 60
const gen_square_50_60 = () => {
    // 51 to 59
    const val = Math.floor(Math.random() * 9) + 51;
    return {
        operands: [val],
        operator: "sq",
        answer: val * val,
        type: "SQUARE_50_60"
    } as unknown as Question;
};

// --- Generator Registry ---


// 43. Squares numbers between 40 and 50 (Base 50 Below)
const gen_square_40_50 = () => {
    // 41 to 49
    const val = Math.floor(Math.random() * 9) + 41;
    return {
        operands: [val],
        operator: "sq",
        answer: val * val,
        type: "SQUARE_40_50"
    } as unknown as Question;
};

// 44. Squares near 100 (90-110)
const gen_square_near_100 = () => {
    // 91-109, excluding 100
    let val = Math.floor(Math.random() * 19) + 91;
    if (val === 100) val = 101;
    return {
        operands: [val],
        operator: "sq",
        answer: val * val,
        type: "SQUARE_NEAR_100"
    } as unknown as Question;
};

// 45. Squares near 150 (145-155)
const gen_square_near_150 = () => {
    const val = Math.floor(Math.random() * 11) + 145;
    return {
        operands: [val],
        operator: "sq",
        answer: val * val,
        type: "SQUARE_NEAR_150"
    } as unknown as Question;
};

// 46. Squares near 200 (195-205)
const gen_square_near_200 = () => {
    const val = Math.floor(Math.random() * 11) + 195;
    return {
        operands: [val],
        operator: "sq",
        answer: val * val,
        type: "SQUARE_NEAR_200"
    } as unknown as Question;
};

// 47. Multiplication near base 100 (e.g. 92 x 97)
const gen_mult_near_base_100 = () => {
    // Both numbers between 91 and 99 (Below base) or 101-109
    const a = Math.floor(Math.random() * 9) + 91; // 91-99
    const b = Math.floor(Math.random() * 9) + 91;

    return {
        operands: [a, b],
        operator: "x",
        answer: a * b,
        type: "MULT_NEAR_BASE_100"
    } as unknown as Question;
};

// 48. Square Roots of numbers ending in 25 (Result ends in 5)
const gen_sqrt_ends_5 = () => {
    // Result is between 15 and 95 (ending in 5)
    // 15, 25, 35 ... 95
    const root = (Math.floor(Math.random() * 9) + 1) * 10 + 5;
    const val = root * root;
    return {
        operands: [val],
        operator: "sqrt",
        answer: root,
        type: "SQRT_ENDS_5"
    } as unknown as Question;
};

// 49. Square Roots of Perfect Squares (2-digit result)
const gen_sqrt_perfect_2d = () => {
    // Result between 11 and 99
    // Avoiding ends in 5 (covered above) or 0 (trivial) if possible, but randomness is fine.
    const root = Math.floor(Math.random() * 89) + 11;
    const val = root * root;
    return {
        operands: [val],
        operator: "sqrt",
        answer: root,
        type: "SQRT_PERFECT_2D"
    } as unknown as Question;
};

// 50. Cube Roots of Perfect Cubes (2-digit result)
const gen_cbrt_perfect_2d = () => {
    // Result between 11 and 99
    // Limit to smaller range initially if needed, but the trick works for all 2d.
    // Let's stick to 11-99.
    const root = Math.floor(Math.random() * 89) + 11;
    const val = root * root * root;
    return {
        operands: [val],
        operator: "cbrt",
        answer: root,
        type: "CBRT_PERFECT_2D"
    } as unknown as Question;
};

// 51. Division by 9 (Integers usually, or result with remainder? Focus on perfect division for speed math context or simple decimals)
// The prompt "Div by 9 family" usually refers to the pattern 1/9=0.111, x/9 = 0.xxx. Or just checking divisibility.
// Let's assume standard integer division where it divides perfectly for now, or returns "Yes/No" if it was a divisibility check.
// Given "Div by 11, 22" usually implies calculating the result.
const gen_div_9_family = () => {
    // Generates a number divisible by 9.
    const quotient = Math.floor(Math.random() * 90) + 10; // 10-99
    const dividend = quotient * 9;
    return {
        operands: [dividend, 9],
        operator: "/",
        answer: quotient,
        type: "DIV_BY_9"
    } as unknown as Question;
};

// 52. Division by 11
const gen_div_11 = () => {
    // Generates a number divisible by 11.
    const quotient = Math.floor(Math.random() * 90) + 10; // 10-99
    const dividend = quotient * 11;
    return {
        operands: [dividend, 11],
        operator: "/",
        answer: quotient,
        type: "DIV_BY_11"
    } as unknown as Question;
};

// 53. Division by 22
const gen_div_22 = () => {
    // Generates a number divisible by 22.
    // Div by 2 then 11.
    const quotient = Math.floor(Math.random() * 45) + 5; // 5-50 (to keep dividend reasonable)
    const dividend = quotient * 22;
    return {
        operands: [dividend, 22],
        operator: "/",
        answer: quotient,
        type: "DIV_BY_22"
    } as unknown as Question;
};

// 54. Broken Heart Division (Splitting Numerator)
// e.g. 648 / 6 -> 600/6 + 48/6 = 100 + 8 = 108.
const gen_div_broken_heart = () => {
    const divisor = Math.floor(Math.random() * 8) + 2; // 2-9
    // Part A: Multiple of 100 * divisor
    // Part B: Multiple of divisor
    const partA = (Math.floor(Math.random() * 9) + 1) * 100 * divisor;
    const partB = (Math.floor(Math.random() * 20) + 1) * divisor; // Ensure partB is simple enough
    const dividend = partA + partB;
    return {
        operands: [dividend, divisor],
        operator: "/",
        answer: dividend / divisor,
        type: "DIV_BROKEN_HEART"
    } as unknown as Question;
};

// 55. Division Approximation
// e.g. 396 / 19 approx 400 / 20 = 20.
const gen_div_approx = () => {
    // Generates questions where operands are close to round numbers
    const roundDivisor = (Math.floor(Math.random() * 8) + 2) * 10; // 20, 30 ... 90
    const divisor = roundDivisor + (Math.random() < 0.5 ? -1 : 1); // 19, 21, 29, 31...

    // Dividend is approximately a multiple of roundDivisor
    const multiple = Math.floor(Math.random() * 10) + 2;
    const approxDividend = multiple * roundDivisor;
    const dividend = approxDividend + (Math.floor(Math.random() * 5) - 2); // +/- small amount

    // Question asks for approximate value? 
    // For MCQ logic, since we usually provide specific answers, maybe I should just calculate the exact integer division?
    // Or providing options that are spaced out.
    // For now, let's just make it a standard division where rounding helps find the CLOSEST integer.
    // Let's stick to "Estimation" type logic logic later or just let the user approximate.
    // Actually, for speed math, usually "approximate division" questions imply "Find the approximate value".
    // I'll calculate the exact float and round it for the "answer", and the frontend can handle "approx" display if needed.
    // But my system compares answers exactly.
    // So let's make it so the "Approximation" IS the exact answer to the ROUNDED problem?
    // User Prompt: "Division approximation".
    // If I show "396 / 19" and expect "20", that's an estimation.
    // Let's generate operands that map to the "clean calculation".
    // Display: "396 / 19 ≈ ?"
    // Answer: 20

    return {
        operands: [dividend, divisor],
        operator: "/", // Maybe visual tweak needed later to show approx symbol
        answer: Math.round(approxDividend / roundDivisor),
        type: "DIV_APPROX"
    } as unknown as Question;
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
    "SUB_CLOSE_100": gen_sub_close_100,
    "MULT_5": gen_mult_5,
    "MULT_50": gen_mult_50,
    "MULT_0_5": gen_mult_0_5,
    "EVEN_X_ENDS_5": gen_even_x_ends_5,
    "MULT_25": gen_mult_25,
    "MULT_125": gen_mult_125,
    "MULT_DECIMALS_25": gen_decimals_25,
    "DIV_5_FAMILY": gen_div_5,
    "DIV_25_FAMILY": gen_div_25,
    "DIV_125_FAMILY": gen_div_125,
    "MULT_11": gen_mult_11,
    "MULT_101": gen_mult_101,
    "MULT_REPEATING_1D": gen_mult_repeating_1d,
    "MULT_9": gen_mult_9,
    "MULT_99": gen_mult_99,
    "MULT_999": gen_mult_999,
    "DIGITAL_SUM": gen_digital_sum,
    "MULT_N_N_PLUS_1": gen_n_n_plus_1,
    "MULT_37_3N": gen_mult_37_3n,
    "MULT_16_SERIES_4": gen_mult_16_series_4,
    "MULT_UNITS_1": gen_mult_units_1,
    "MULT_3D_MIDDLE_0": gen_mult_3d_middle_0,
    "MULT_CONSECUTIVE_EVEN_ODD": gen_mult_consecutive_even_odd,
    "MULT_1_5": gen_mult_1_5,
    "MULT_15": gen_mult_15,
    "MULT_2_5": gen_mult_2_5,
    "MULT_CRISS_CROSS": gen_mult_criss_cross,
    "MULT_SPLIT": gen_mult_split,
    "SQUARE_ENDS_5": gen_square_ends_5,
    "SQUARE_50_60": gen_square_50_60,
    "SQUARE_ENDS_5_3D": gen_square_ends_5_3d,
    "SQUARE_40_50": gen_square_40_50,
    "SQUARE_NEAR_100": gen_square_near_100,
    "SQUARE_NEAR_150": gen_square_near_150,
    "SQUARE_NEAR_200": gen_square_near_200,
    "MULT_NEAR_BASE_100": gen_mult_near_base_100,
    "SQRT_ENDS_5": gen_sqrt_ends_5,
    "SQRT_PERFECT_2D": gen_sqrt_perfect_2d,
    "CBRT_PERFECT_2D": gen_cbrt_perfect_2d,
    "DIV_BY_9": gen_div_9_family,
    "DIV_BY_11": gen_div_11,
    "DIV_BY_22": gen_div_22,
    "DIV_BROKEN_HEART": gen_div_broken_heart,
    "DIV_APPROX": gen_div_approx,
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
    },
    4: {
        id: 4,
        title: "Subtraction: Base Method & Tables 13-15",
        linearTasks: [
            {
                id: "d4_sub_close_100",
                title: "Close to 100",
                description: "Difference between numbers near 100.",
                generatorId: "SUB_CLOSE_100",
                targetCount: 10
            },
            {
                id: "d4_tables",
                title: "Tables 13-15",
                description: "Multiplication tables 13, 14, 15.",
                generatorId: "TABLES",
                generatorConfig: { min: 13, max: 15 },
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "SUB_CLOSE_100" },
            { id: "TABLES", config: { min: 13, max: 15 } }
        ]
    },
    5: {
        id: 5,
        title: "The '5' Family & Tables 16-18",
        linearTasks: [
            {
                id: "d5_mult_5",
                title: "Multiply by 5",
                description: "The classic half and add zero trick.",
                generatorId: "MULT_5",
                targetCount: 10
            },
            {
                id: "d5_mult_50",
                title: "Multiply by 50",
                description: "Same as x5 but add two zeros.",
                generatorId: "MULT_50",
                targetCount: 10
            },
            {
                id: "d5_even_ends_5",
                title: "Even x Ends in 5",
                description: "Double one, halve the other.",
                generatorId: "EVEN_X_ENDS_5",
                targetCount: 10
            },
            {
                id: "d5_tables",
                title: "Tables 16-18",
                description: "Multiplication tables 16, 17, 18.",
                generatorId: "TABLES",
                generatorConfig: { min: 16, max: 18 },
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "MULT_5" },
            { id: "MULT_50" },
            { id: "EVEN_X_ENDS_5" },
            { id: "TABLES", config: { min: 16, max: 18 } }
        ]
    },
    6: {
        id: 6,
        title: "The '25' Family & Tables 19-21",
        linearTasks: [
            {
                id: "d6_mult_25",
                title: "Multiply by 25",
                description: "Divide by 4, add two zeros.",
                generatorId: "MULT_25",
                targetCount: 10
            },
            {
                id: "d6_mult_125",
                title: "Multiply by 125",
                description: "Divide by 8, add three zeros.",
                generatorId: "MULT_125",
                targetCount: 10
            },
            {
                id: "d6_decimals",
                title: "Decimal Mults",
                description: "x0.25, x1.25, x12.5 tricks.",
                generatorId: "MULT_DECIMALS_25",
                targetCount: 10
            },
            {
                id: "d6_tables",
                title: "Tables 19-21",
                description: "Multiplication tables 19, 20, 21.",
                generatorId: "TABLES",
                generatorConfig: { min: 19, max: 21 },
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "MULT_25" },
            { id: "MULT_125" },
            { id: "MULT_DECIMALS_25" },
            { id: "TABLES", config: { min: 19, max: 21 } }
        ]
    },
    7: {
        id: 7,
        title: "Division Mastery & Tables 22-25",
        linearTasks: [
            {
                id: "d7_div_5",
                title: "Div by 5, 50, 0.5",
                description: "Double the number, then adjust decimal.",
                generatorId: "DIV_5_FAMILY",
                targetCount: 10
            },
            {
                id: "d7_div_25",
                title: "Div by 25, 0.25",
                description: "Mult by 4, then adjust decimal.",
                generatorId: "DIV_25_FAMILY",
                targetCount: 10
            },
            {
                id: "d7_div_125",
                title: "Div by 125, 0.125",
                description: "Mult by 8, then adjust decimal.",
                generatorId: "DIV_125_FAMILY",
                targetCount: 10
            },
            {
                id: "d7_tables",
                title: "Tables 22-25",
                description: "Multiplication tables 22, 23, 24, 25.",
                generatorId: "TABLES",
                generatorConfig: { min: 22, max: 25 },
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "DIV_5_FAMILY" },
            { id: "DIV_25_FAMILY" },
            { id: "DIV_125_FAMILY" },
            { id: "TABLES", config: { min: 22, max: 25 } }
        ]
    },
    8: {
        id: 8,
        title: "The '1' Family & Review",
        linearTasks: [
            {
                id: "d8_mult_11",
                title: "Multiply by 11",
                description: "Add neighbors trick.",
                generatorId: "MULT_11",
                targetCount: 10
            },
            {
                id: "d8_mult_101",
                title: "Mult by 101/1001",
                description: "Repeating digit patterns.",
                generatorId: "MULT_101",
                targetCount: 10
            },
            {
                id: "d8_repeating",
                title: "Repeating Digits",
                description: "Tricks for 22x, 33x etc.",
                generatorId: "MULT_REPEATING_1D",
                targetCount: 10
            },
            {
                id: "d8_tables_review",
                title: "Review Tables 1-15",
                description: "Rapid review of tables 1 to 15.",
                generatorId: "TABLES",
                generatorConfig: { min: 2, max: 15 },
                targetCount: 15
            }
        ],
        unlockedGenerators: [
            { id: "MULT_11" },
            { id: "MULT_101" },
            { id: "MULT_REPEATING_1D" },
            { id: "TABLES", config: { min: 2, max: 15 } }
        ]
    },
    9: {
        id: 9,
        title: "The '9' Family & Review",
        linearTasks: [
            {
                id: "d9_mult_9",
                title: "Multiply by 9",
                description: "Mult by 10 minus 1.",
                generatorId: "MULT_9",
                targetCount: 10
            },
            {
                id: "d9_mult_99",
                title: "Multiply by 99",
                description: "The 1-less and complement trick.",
                generatorId: "MULT_99",
                targetCount: 10
            },
            {
                id: "d9_mult_999",
                title: "Multiply by 999",
                description: "Same trick for 3-digit numbers.",
                generatorId: "MULT_999",
                targetCount: 10
            },
            {
                id: "d9_tables_review",
                title: "Review Tables 16-25",
                description: "Rapid review of higher tables.",
                generatorId: "TABLES",
                generatorConfig: { min: 16, max: 25 },
                targetCount: 15
            }
        ],
        unlockedGenerators: [
            { id: "MULT_9" },
            { id: "MULT_99" },
            { id: "MULT_999" },
            { id: "TABLES", config: { min: 16, max: 25 } }
        ]
    },
    10: {
        id: 10,
        title: "Digital Sum & Squares 1-15",
        linearTasks: [
            {
                id: "d10_digital_sum",
                title: "Digital Sum",
                description: "Find the digital sum (Casting Out Nines).",
                generatorId: "DIGITAL_SUM",
                targetCount: 10
            },
            {
                id: "d10_product_n_plus_1",
                title: "Product n(n+1)",
                description: "Multiply consecutive numbers (e.g. 12x13).",
                generatorId: "MULT_N_N_PLUS_1",
                targetCount: 10
            },
            {
                id: "d10_squares_review",
                title: "Squares 1-15",
                description: "Memorize squares up to 15.",
                generatorId: "SQUARES",
                generatorConfig: { min: 1, max: 15 },
                targetCount: 15
            }
        ],
        unlockedGenerators: [
            { id: "DIGITAL_SUM" },
            { id: "MULT_N_N_PLUS_1" },
            { id: "SQUARES", config: { min: 1, max: 15 } }
        ]
    },
    11: {
        id: 11,
        title: "Magic Patterns & Squares 16-30",
        linearTasks: [
            {
                id: "d11_mult_37_3n",
                title: "The 111 Trick",
                description: "Multiply 37 by 3, 6, 9... (37x3n)",
                generatorId: "MULT_37_3N",
                targetCount: 10
            },
            {
                id: "d11_mult_16_series_4",
                title: "Patterns of 16...6x4",
                description: "Multiply 16, 166, 1666... by 4.",
                generatorId: "MULT_16_SERIES_4",
                targetCount: 10
            },
            {
                id: "d11_squares_review",
                title: "Squares 16-30",
                description: "Memorize squares 16 to 30.",
                generatorId: "SQUARES",
                generatorConfig: { min: 16, max: 30 },
                targetCount: 15
            }
        ],
        unlockedGenerators: [
            { id: "MULT_37_3N" },
            { id: "MULT_16_SERIES_4" },
            { id: "SQUARES", config: { min: 16, max: 30 } }
        ]
    },
    12: {
        id: 12,
        title: "Magic Patterns II & Squares 31-40",
        linearTasks: [
            {
                id: "d12_mult_units_1",
                title: "Unit Digit 1",
                description: "Multiply numbers ending in 1 (e.g. 31x41).",
                generatorId: "MULT_UNITS_1",
                targetCount: 10
            },
            {
                id: "d12_mult_3d_middle_0",
                title: "Middle 0 Trick",
                description: "Multiply 3-digit numbers with middle 0.",
                generatorId: "MULT_3D_MIDDLE_0",
                targetCount: 10
            },
            {
                id: "d12_mult_consecutive_even_odd",
                title: "Neighbors (n² - 1)",
                description: "Multiply consecutive even/odd numbers.",
                generatorId: "MULT_CONSECUTIVE_EVEN_ODD",
                targetCount: 10
            },
            {
                id: "d12_squares_review",
                title: "Squares 31-40",
                description: "Memorize squares 31 to 40.",
                generatorId: "SQUARES",
                generatorConfig: { min: 31, max: 40 },
                targetCount: 15
            }
        ],
        unlockedGenerators: [
            { id: "MULT_UNITS_1" },
            { id: "MULT_3D_MIDDLE_0" },
            { id: "MULT_CONSECUTIVE_EVEN_ODD" },
            { id: "SQUARES", config: { min: 31, max: 40 } }
        ]
    },
    13: {
        id: 13,
        title: "Multiplying by 1.5, 2.5, 15",
        linearTasks: [
            {
                id: "d13_mult_1_5",
                title: "Multiply by 1.5",
                description: "Trick: Number + Half.",
                generatorId: "MULT_1_5",
                targetCount: 10
            },
            {
                id: "d13_mult_2_5",
                title: "Multiply by 2.5",
                description: "Trick: Double + Half.",
                generatorId: "MULT_2_5",
                targetCount: 10
            },
            {
                id: "d13_mult_15",
                title: "Multiply by 15",
                description: "Trick: (Number + Half) x 10.",
                generatorId: "MULT_15",
                targetCount: 10
            },
            {
                id: "d13_squares_review",
                title: "Squares 41-50",
                description: "Memorize squares 41 to 50.",
                generatorId: "SQUARES",
                generatorConfig: { min: 41, max: 50 },
                targetCount: 15
            }
        ],
        unlockedGenerators: [
            { id: "MULT_1_5" },
            { id: "MULT_2_5" },
            { id: "MULT_15" },
            { id: "SQUARES", config: { min: 41, max: 50 } }
        ]
    },
    14: {
        id: 14,
        title: "General Multiplication I",
        linearTasks: [
            {
                id: "d14_criss_cross",
                title: "Criss-Cross (2x2)",
                description: "Universal method for 2-digit multiplication.",
                generatorId: "MULT_CRISS_CROSS",
                targetCount: 10
            },
            {
                id: "d14_split",
                title: "Product Partition (Split)",
                description: "Split one number and multiply separately.",
                generatorId: "MULT_SPLIT",
                targetCount: 10
            },
            {
                id: "d14_squares_review",
                title: "Squares 1-50 Review",
                description: "Comprehensive review of squares 1-50.",
                generatorId: "SQUARES",
                generatorConfig: { min: 1, max: 50 },
                targetCount: 20
            }
        ],
        unlockedGenerators: [
            { id: "MULT_CRISS_CROSS" },
            { id: "MULT_SPLIT" },
            { id: "SQUARES", config: { min: 1, max: 50 } }
        ]
    },
    15: {
        id: 15,
        title: "Squares: The Basics & 50-60",
        linearTasks: [
            {
                id: "d15_ends_5",
                title: "Squares Ending in 5",
                description: "Trick: n(n+1) | 25.",
                generatorId: "SQUARE_ENDS_5",
                targetCount: 10
            },
            {
                id: "d15_ends_5_3d",
                title: "Squares Ending in 5 (3-Digit)",
                description: "Trick: Same, but n is larger (e.g. 10, 11).",
                generatorId: "SQUARE_ENDS_5_3D",
                targetCount: 5
            },
            {
                id: "d15_50_60",
                title: "Squares 51-60",
                description: "Trick: (25 + d) | d².",
                generatorId: "SQUARE_50_60",
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "SQUARE_ENDS_5" },
            { id: "SQUARE_ENDS_5_3D" },
            { id: "SQUARE_50_60" }
        ]
    },
    16: {
        id: 16,
        title: "Squares: Base 50 & Halving",
        linearTasks: [
            {
                id: "d16_40_50",
                title: "Squares 41-50 (Below Base 50)",
                description: "Trick: (25 - d) | d².",
                generatorId: "SQUARE_40_50",
                targetCount: 10
            },
            {
                id: "d16_mult_0_5",
                title: "Multiply by 0.5",
                description: "Recall: Multiplying by 0.5 is just Halving.",
                generatorId: "MULT_0_5",
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "SQUARE_40_50" },
            { id: "MULT_0_5" },
            { id: "SQUARES", config: { min: 41, max: 60 } }
        ]
    },
    17: {
        id: 17,
        title: "Universal Base Method",
        linearTasks: [
            {
                id: "d17_sq_base_100",
                title: "Squares Near 100",
                description: "Trick: (100 +/- d) | d².",
                generatorId: "SQUARE_NEAR_100",
                targetCount: 10
            },
            {
                id: "d17_sq_base_150_200",
                title: "Squares Near 150 & 200",
                description: "Base 150 (1.5x) and Base 200 (2x).",
                generatorId: "SQUARE_NEAR_150", // Start with 150, user can mix later or I can add a mixed generator. 
                // Let's add 200 as a separate unlocked item or just use Mixed in the future.
                // Ideally I should have a mixed generator for this task.
                // For now, I'll just use 150 here and unlock 200.
                // Actually, let's look at the user request: "Squares near 100, 150, 200".
                // Maybe I should split this into two tasks?
                // Task 2: Squares Near 150.
                // Task 3: Squares Near 200?
                // Or Task 2: Larger Bases (150 & 200) -> using a mixed generator?
                // I didn't create a mixed generator. I created specific ones.
                // Let's add two tasks then.
                targetCount: 5
            },
            {
                id: "d17_sq_base_200",
                title: "Squares Near 200",
                description: "Base 200: Double the Base 100 logic.",
                generatorId: "SQUARE_NEAR_200",
                targetCount: 5
            },
            {
                id: "d17_mult_base_100",
                title: "Base Multiplication",
                description: "Multiplying numbers near 100 (e.g. 92x97).",
                generatorId: "MULT_NEAR_BASE_100",
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "SQUARE_NEAR_100" },
            { id: "SQUARE_NEAR_150" },
            { id: "SQUARE_NEAR_200" },
            { id: "MULT_NEAR_BASE_100" }
        ]
    },
    18: {
        id: 18,
        title: "Square Roots",
        linearTasks: [
            {
                id: "d18_sqrt_ends_5",
                title: "Square Roots Ending in 5",
                description: "Find root of number ending in 25 (e.g. 2025).",
                generatorId: "SQRT_ENDS_5",
                targetCount: 10
            },
            {
                id: "d18_sqrt_perfect",
                title: "Estimating Square Roots",
                description: "Find the root of Perfect Squares (e.g. 1764).",
                generatorId: "SQRT_PERFECT_2D",
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "SQRT_ENDS_5" },
            { id: "SQRT_PERFECT_2D" },
            { id: "SQUARES", config: { min: 81, max: 90 } }
        ]
    },
    19: {
        id: 19,
        title: "Cubes & Cube Roots",
        linearTasks: [
            {
                id: "d19_cbrt_trick",
                title: "Perfect Cube Roots",
                description: "Using the Last Digit Trick to find cube roots.",
                generatorId: "CBRT_PERFECT_2D",
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "CBRT_PERFECT_2D" }
        ]
    },
    20: {
        id: 20,
        title: "Advanced Division I",
        linearTasks: [
            {
                id: "d20_div_9",
                title: "Division by 9",
                description: "Divisibility rule: Sum of digits.",
                generatorId: "DIV_BY_9",
                targetCount: 10
            },
            {
                id: "d20_div_11",
                title: "Division by 11",
                description: "Divisibility rule: Alt sum diff is 0 or 11.",
                generatorId: "DIV_BY_11",
                targetCount: 10
            },
            {
                id: "d20_div_22",
                title: "Division by 22",
                description: "Divide by 2, then by 11.",
                generatorId: "DIV_BY_22",
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "DIV_BY_9" },
            { id: "DIV_BY_11" },
            { id: "DIV_BY_22" }
        ]
    },
    21: {
        id: 21,
        title: "Advanced Division II",
        linearTasks: [
            {
                id: "d21_broken_heart",
                title: "Broken Heart Method",
                description: "Split the numerator into easy chunks.",
                generatorId: "DIV_BROKEN_HEART",
                targetCount: 10
            },
            {
                id: "d21_approx",
                title: "Approximation",
                description: "Estimate division by rounding.",
                generatorId: "DIV_APPROX",
                targetCount: 10
            }
        ],
        unlockedGenerators: [
            { id: "DIV_BROKEN_HEART" },
            { id: "DIV_APPROX" }
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

