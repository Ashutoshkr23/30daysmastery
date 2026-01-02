"use client";

import { useEffect, useState, useRef } from "react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { challengeConfig, Question } from "@/lib/generators";
import { Loader2, RefreshCcw, CheckCircle2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { logAttempt, getRecentAttempts } from "@/lib/actions/progress";

interface PracticeSessionProps {
    dayId: number;
    onComplete?: (success: boolean, accuracy: number) => void;
}

const CORRECT_ANSWERS_GOAL = 10;

export function PracticeSession({ dayId, onComplete }: PracticeSessionProps) {
    // Config
    const dayConfig = challengeConfig[dayId];
    // Default to first task for simplicity in "Practice" tab, or let user choose. 
    // For now, let's just cycle through tasks or pick the first one.
    // The user's code had a /task/:taskNumber param. 
    // We'll implementing a "Task Selector" later, for now, let's default to Task 1.
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const currentTask = dayConfig?.tasks[currentTaskIndex];

    // State
    const [started, setStarted] = useState(false);
    const [question, setQuestion] = useState<Question | null>(null);
    const [tempAnswer, setTempAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

    // Focus Ref
    const inputRef = useRef<HTMLInputElement>(null);

    const loadAttempts = async () => {
        console.log("PracticeSession: loadAttempts calling for day", dayId);
        const attempts = await getRecentAttempts('speed-maths', dayId);
        console.log("PracticeSession: loadAttempts received", attempts);
        setRecentAttempts(attempts || []);
    };

    useEffect(() => {
        console.log("PracticeSession mounted or dayId changed:", dayId);
        loadAttempts();
    }, [dayId]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (started && startTime && !showResult) {
            timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [started, startTime, showResult]);

    // Generate First Question on Start
    const startSession = () => {
        if (!currentTask) return;
        setStarted(true);
        setScore(0);
        setQuestionCount(1);
        setShowResult(false);
        setStartTime(Date.now());
        setElapsedTime(0);
        generateNewQuestion();
    };

    const generateNewQuestion = () => {
        if (!currentTask) return;
        const q = currentTask.generator();
        setQuestion(q);
        setTempAnswer(null);
        // Auto-focus input
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setTempAnswer(isNaN(val) ? null : val);

        // Auto-submit mechanism
        if (question && !isNaN(val)) {
            const answerString = question.answer.toString();
            const valString = val.toString();

            // Strict length check or exact match
            if (valString.length >= answerString.length) {
                if (val === question.answer) {
                    handleCorrect();
                } else {
                    handleWrong();
                }
            }
        }
    };

    const handleWrong = () => {
        setQuestionCount(prev => prev + 1); // Penalize accuracy
        setTempAnswer(null); // Clear input
        // Could add visual feedback state here if needed
    };

    const handleCorrect = () => {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore >= CORRECT_ANSWERS_GOAL) {
            finishSession();
        } else {
            setQuestionCount(prev => prev + 1);
            generateNewQuestion();
        }
    }

    const [saveError, setSaveError] = useState<string | null>(null);

    const finishSession = async () => {
        setShowResult(true);
        setStarted(false);

        const accuracy = score / questionCount;
        const passed = accuracy >= 0.8; // 80% Threshold

        if (onComplete) onComplete(passed, Math.round(accuracy * 100));

        // Log to DB
        try {
            const result = await logAttempt({
                course_id: 'speed-maths',
                day_id: dayId,
                score,
                total_questions: questionCount,
                accuracy: accuracy * 100, // Store as percentage e.g. 95.5
                time_taken: elapsedTime,
                passed
            });

            if (!result || !result.success) {
                setSaveError(result?.error || "Unknown error saving attempt");
            } else {
                await loadAttempts(); // Refresh history
            }
        } catch (e: any) {
            setSaveError(e.message);
        }

        console.log("Session Complete!", { score, questionCount, accuracy, passed });
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}m ${sec}s`;
    };

    // --- Renders ---

    // Debug helper
    if (dayConfig) {
        // Just appending debug JSX to the return isn't easy with replacing the whole block.
        // I'll inject the debug view into the showResult and default views via a helper or appended JSX.
    }

    if (!dayConfig) {
        return <div>Configuration for Day {dayId} not found.</div>;
    }

    if (showResult) {
        const accuracy = Math.round((score / questionCount) * 100);
        const passed = accuracy >= 80;

        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in-90">
                <div className={cn("h-24 w-24 rounded-full flex items-center justify-center mb-4", passed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500")}>
                    {passed ? <CheckCircle2 className="h-12 w-12" /> : <RefreshCcw className="h-12 w-12" />}
                </div>
                <div>
                    <h2 className="text-3xl font-bold">{passed ? "Challenge Completed!" : "Accuracy Too Low"}</h2>
                    <p className="text-muted-foreground mt-2">
                        {passed
                            ? "You have unlocked the Arena."
                            : "You need 80% accuracy to pass. Try again!"}
                    </p>
                </div>

                {saveError && (
                    <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">
                        Database Error: {saveError}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <GlassCard className="p-4 flex flex-col items-center">
                        <span className="text-sm text-muted-foreground">Accuracy</span>
                        <span className={cn("text-2xl font-bold", passed ? "text-green-400" : "text-red-400")}>{accuracy}%</span>
                    </GlassCard>
                    <GlassCard className="p-4 flex flex-col items-center">
                        <span className="text-sm text-muted-foreground">Time</span>
                        <span className="text-2xl font-bold">{formatTime(elapsedTime)}</span>
                    </GlassCard>
                </div>

                <div className="flex gap-4">
                    <PremiumButton onClick={startSession} variant={passed ? "outline" : undefined}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Retry
                    </PremiumButton>
                    {passed && dayConfig.tasks[currentTaskIndex + 1] && (
                        <PremiumButton onClick={() => {
                            setCurrentTaskIndex(prev => prev + 1);
                            setStarted(false);
                            setShowResult(false);
                        }}>
                            Next Task
                        </PremiumButton>
                    )}
                </div>

                {/* Recent Attempts List (Compact) */}
                {recentAttempts.length > 0 && (
                    <div className="w-full max-w-sm mt-8 text-left">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <History className="h-4 w-4" /> Recent History
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {recentAttempts.map((attempt) => (
                                <div key={attempt.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", attempt.passed ? "bg-green-500" : "bg-red-500")} />
                                        <span>{new Date(attempt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex gap-3 text-muted-foreground">
                                        <span>{attempt.score}/{attempt.total_questions}</span>
                                        <span>{attempt.score >= attempt.total_questions * 0.8 ? "Passed" : "Failed"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DEBUG VIEW */}
                <div className="w-full mt-4 text-xs text-left p-4 bg-black/50 rounded overflow-auto h-32">
                    <p className="font-bold text-yellow-500 mb-2">DEBUG DATA:</p>
                    <pre>{JSON.stringify({ dayId, recentAttemptsCount: recentAttempts.length, attempts: recentAttempts }, null, 2)}</pre>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                <h2 className="text-2xl font-bold  bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {currentTask?.name || `Task ${currentTaskIndex + 1}`}
                </h2>
                <p className="text-muted-foreground max-w-md">
                    Answer {CORRECT_ANSWERS_GOAL} questions correctly to complete this reinforcement task.
                </p>

                {/* Task Selector (Optional) */}
                <div className="flex gap-2 flex-wrap justify-center">
                    {dayConfig.tasks.map((t, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentTaskIndex(idx)}
                            className={`px-3 py-1 rounded-full text-xs border ${idx === currentTaskIndex ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-white/10'}`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>

                <PremiumButton size="lg" onClick={startSession} className="w-full max-w-xs transition-transform hover:scale-105">
                    Start Practice 🚀
                </PremiumButton>

                {/* Recent Attempts List on Start Screen */}
                {recentAttempts.length > 0 && (
                    <div className="w-full max-w-sm mt-12 text-left">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <History className="h-4 w-4" /> Your Previous Attempts
                        </h3>
                        <div className="space-y-2">
                            {recentAttempts.slice(0, 3).map((attempt) => (
                                <div key={attempt.id} className="flex justify-between items-center text-sm p-3 rounded-lg bg-secondary/20 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", attempt.passed ? "bg-green-500" : "bg-red-500")} />
                                        <span className="text-foreground/80">{new Date(attempt.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="font-mono">
                                        {attempt.score}/{attempt.total_questions} <span className="text-muted-foreground text-xs ml-1">({Math.round(attempt.accuracy)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto space-y-8">
            {/* Header Stats */}
            <div className="flex w-full justify-between items-center px-4 text-sm font-medium text-muted-foreground uppercase tracking-widest">
                <span>{currentTask?.name}</span>
                <span>{score} / {CORRECT_ANSWERS_GOAL}</span>
                <span>{formatTime(elapsedTime)}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(score / CORRECT_ANSWERS_GOAL) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="relative w-full">
                <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full" />
                <GlassCard className="relative p-12 flex flex-col items-center space-y-8 border-primary/20 bg-background/40 backdrop-blur-2xl">

                    {question && (
                        <div className="text-6xl md:text-8xl font-black tracking-tighter text-foreground flex items-center gap-4">
                            <span>{question.operands[0]}</span>
                            <span className="text-primary">{question.operator}</span>
                            <span>{question.operands[1]}</span>
                            <span className="text-muted-foreground">=</span>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="number"
                        value={tempAnswer ?? ''}
                        onChange={handleChange}
                        placeholder="?"
                        className="w-full max-w-[200px] bg-transparent text-center text-6xl md:text-8xl font-bold outline-none placeholder:text-white/10"
                        autoFocus
                    />
                </GlassCard>
            </div>

            <p className="text-sm text-muted-foreground animate-pulse">
                Type the answer...
            </p>
        </div>
    );
}
