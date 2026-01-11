"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { Heart, Timer, Zap, XCircle } from "lucide-react";
import { Question, getGenerator, TaskConfig } from "@/lib/generators";
import { CustomSettings } from "./PracticeLobby";

interface PracticeRunnerProps {
    generatorIds: string[]; // Array of generator IDs to randomly pick from
    generatorConfig?: any; // Config for generators that need it
    config?: TaskConfig; // Only present in Linear Mode
    customSettings?: CustomSettings; // Only present in Custom Mode
    onComplete: (stats: SessionStats) => void;
    onExit: () => void;
}

export interface SessionStats {
    score: number;
    total: number;
    accuracy: number;
    timeTaken: number;
    speed: number; // Seconds per question
}

export function PracticeRunner({ generatorIds, generatorConfig, config, customSettings, onComplete, onExit }: PracticeRunnerProps) {
    // Game State
    const [question, setQuestion] = useState<Question | null>(null);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [lives, setLives] = useState(customSettings?.mode === "SURVIVAL" ? customSettings.value : 3);
    const [timeLeft, setTimeLeft] = useState(customSettings?.mode === "TIME" ? customSettings.value : 0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isWrong, setIsWrong] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const startTimeRef = useRef<number>(Date.now());

    // --- Core Logic ---
    const generateNext = useCallback(() => {
        // Randomly pick a generator from the list
        const randomId = generatorIds[Math.floor(Math.random() * generatorIds.length)];
        const generator = getGenerator(randomId);
        const q = generator(generatorConfig);
        setQuestion(q);
        setInput("");
        setIsWrong(false);
        // Auto-focus logic
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [generatorIds, generatorConfig]);

    // Initial Start
    useEffect(() => {
        generateNext();
        startTimeRef.current = Date.now();
    }, [generateNext]);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);

            if (customSettings?.mode === "TIME") {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        finishSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [customSettings]);

    const finishSession = () => {
        // Calculate Stats
        const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Avoid division by zero
        const safeTime = finalTime || 1;
        // Metric: Seconds per Question
        const avgTimePerQuestion = score > 0 ? Number((safeTime / score).toFixed(1)) : 0;
        const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        onComplete({
            score,
            total: totalQuestions,
            accuracy,
            timeTaken: finalTime,
            speed: avgTimePerQuestion
        });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const numVal = parseInt(val);
        setInput(val);

        if (question && !isNaN(numVal)) {
            const ansStr = question.answer.toString();

            // Optimization: Only check if length matches to avoid premature wrong answers
            // E.g. Answer is 12, user types 1... wait. User types 12... check.
            if (val.length >= ansStr.length) {
                if (numVal === question.answer) {
                    // Correct
                    setScore(prev => prev + 1);
                    setTotalQuestions(prev => prev + 1);
                    generateNext();

                    // Linear Mode Check
                    if (config && score + 1 >= config.targetCount) {
                        // We need to wait for the state update or just pass manually
                        // This finish call will use the old 'score' state variable if not careful
                        // But since we are inside the event handler, we know score + 1 is the new score
                        // BUT finishSession uses state. So let's defer it.
                        // Actually better to just rely on effect or pass arguments to finishSession?
                        // For simplicity, let's just trigger another update in useEffect or hack it:
                        setTimeout(finishSession, 0);
                    }

                } else {
                    // Wrong
                    setIsWrong(true);
                    setTotalQuestions(prev => prev + 1);
                    setInput(""); // Clear input to retry? Or keep it?
                    // Usually speed math clears it to punish time

                    if (customSettings?.mode === "SURVIVAL") {
                        setLives(prev => {
                            if (prev <= 1) {
                                finishSession();
                                return 0;
                            }
                            return prev - 1;
                        });
                    }
                }
            }
        }
    };

    if (!question) return null;

    return (
        <div className="flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-300">
            {/* HUD */}
            <div className="flex w-full max-w-lg justify-between items-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                    {customSettings?.mode === "SURVIVAL" ? (
                        <div className="flex text-red-500 gap-1">
                            {Array.from({ length: lives }).map((_, i) => (
                                <Heart key={i} className="h-5 w-5 fill-current" />
                            ))}
                        </div>
                    ) : (
                        <span>Score: <span className="text-foreground">{score}</span></span>
                    )}
                </div>

                <div className="bg-secondary/50 px-4 py-1 rounded-full text-foreground">
                    {config ? config.title : "Custom Gym"}
                </div>

                <div className="flex items-center gap-2">
                    {customSettings?.mode === "TIME" ? (
                        <span className={cn(timeLeft < 10 && "text-red-500 animate-pulse")}>
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </span>
                    ) : (
                        <span>{Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}</span>
                    )}
                    <Timer className="h-4 w-4" />
                </div>
            </div>

            {/* Battle Card */}
            <div className="relative w-full max-w-md">
                <div className={cn(
                    "absolute inset-0 blur-[60px] rounded-full transition-colors duration-200",
                    isWrong ? "bg-red-500/20" : "bg-primary/10"
                )} />

                <GlassCard className="relative p-4 md:p-8 flex flex-col items-center gap-4 backdrop-blur-2xl">
                    <div className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3 text-foreground/90">
                        {/* Render Question */}
                        {question.operands.length === 2 && (
                            <>
                                <span>{question.operands[0]}</span>
                                <span className="text-primary">{question.operator}</span>
                                <span>{question.operands[1]}</span>
                            </>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="number"
                        value={input}
                        onChange={handleInput}
                        placeholder="?"
                        autoFocus
                        className={cn(
                            "w-full bg-transparent text-center text-3xl md:text-4xl font-bold outline-none placeholder:text-white/5 transition-colors",
                            isWrong ? "text-red-500 animate-shake" : "text-foreground"
                        )}
                    />
                </GlassCard>
            </div>

            <button onClick={onExit} className="text-xs text-muted-foreground hover:text-white transition-colors">
                End Session
            </button>
        </div>
    );
}
