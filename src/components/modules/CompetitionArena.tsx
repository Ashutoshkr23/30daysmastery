"use client";

import { useEffect, useState, useRef } from "react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { challengeConfig, Question } from "@/lib/generators";
import { Loader2, Zap, Trophy, Timer, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { logAttempt } from "@/lib/actions/progress";

interface CompetitionArenaProps {
    dayId: number;
    onComplete?: () => void;
}

const ARENA_GOAL = 20; // Harder than practice
const TIME_PENALTY = 5; // +5 seconds for wrong answer

export function CompetitionArena({ dayId, onComplete }: CompetitionArenaProps) {
    const dayConfig = challengeConfig[dayId];

    // State
    const [started, setStarted] = useState(false);
    const [question, setQuestion] = useState<Question | null>(null);
    const [tempAnswer, setTempAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [penaltyTime, setPenaltyTime] = useState(0); // Track added penalty

    const inputRef = useRef<HTMLInputElement>(null);

    // Timer Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (started && startTime && !showResult) {
            timer = setInterval(() => {
                const realTime = (Date.now() - startTime) / 1000;
                setElapsedTime(Math.floor(realTime + penaltyTime));
            }, 100);
        }
        return () => clearInterval(timer);
    }, [started, startTime, showResult, penaltyTime]);

    // Setup Task (Default to first for now, or mix?)
    const currentTask = dayConfig?.tasks[0];

    // Start
    const enterArena = () => {
        if (!currentTask) return;
        setStarted(true);
        setScore(0);
        setQuestionCount(1);
        setShowResult(false);
        setPenaltyTime(0);
        setStartTime(Date.now());
        setElapsedTime(0);
        generateNewQuestion();
    };

    const generateNewQuestion = () => {
        if (!currentTask) return;
        const q = currentTask.generator();
        setQuestion(q);
        setTempAnswer(null);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setTempAnswer(isNaN(val) ? null : val);

        if (question && !isNaN(val)) {
            const answerString = question.answer.toString();
            const valString = val.toString();

            if (valString.length >= answerString.length) {
                if (val === question.answer) {
                    handleCorrect();
                } else {
                    handleWrong();
                }
            }
        }
    };

    const handleCorrect = () => {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore >= ARENA_GOAL) {
            finishArena();
        } else {
            setQuestionCount(prev => prev + 1);
            generateNewQuestion();
        }
    };

    const handleWrong = () => {
        // Penalty!
        setPenaltyTime(prev => prev + TIME_PENALTY);
        setTempAnswer(null); // Clear input to force retry
        // Maybe show visual flash?
    };

    const finishArena = async () => {
        setShowResult(true);
        setStarted(false);

        const finalTime = elapsedTime;
        const accuracy = Math.round((ARENA_GOAL / (questionCount + (penaltyTime / TIME_PENALTY))) * 100); // Approximation

        // Log to DB
        await logAttempt({
            course_id: 'speed-maths',
            day_id: dayId,
            score: ARENA_GOAL,
            total_questions: questionCount,
            accuracy: 100, // In Time Attack, you effectively get 100% eventually, but time suffers. Let's record 100 for now or calculate real attempts.
            time_taken: finalTime,
            passed: true
        });

        if (onComplete) onComplete();
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    if (!dayConfig) return <div>Arena not available.</div>;

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in zoom-in-95">
                <div className="bg-amber-500/20 p-6 rounded-full ring-4 ring-amber-500/20">
                    <Trophy className="h-16 w-16 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-amber-500 uppercase tracking-widest">Victory</h2>
                    <p className="text-amber-200/80 mt-2">The Arena has been conquered.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <GlassCard className="p-6 border-amber-500/30 bg-black/40">
                        <span className="text-xs text-amber-500/60 uppercase">Final Time</span>
                        <div className="text-3xl font-mono font-bold text-amber-400">{formatTime(elapsedTime)}</div>
                    </GlassCard>
                    <GlassCard className="p-6 border-amber-500/30 bg-black/40">
                        <span className="text-xs text-amber-500/60 uppercase">Score</span>
                        <div className="text-3xl font-mono font-bold text-amber-400">{score}</div>
                    </GlassCard>
                </div>

                <PremiumButton onClick={enterArena} className="bg-amber-600 hover:bg-amber-700 text-white border-none">
                    <Zap className="mr-2 h-4 w-4" /> Go Again
                </PremiumButton>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="text-center space-y-6 py-12">
                <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4 animate-pulse">
                    <Zap className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-red-100">Enter The Arena</h2>
                <div className="max-w-md mx-auto space-y-2 text-red-200/60">
                    <p>🔥 <strong>{ARENA_GOAL} Questions</strong> Time Attack</p>
                    <p>⚡ <strong>+5s Penalty</strong> for wrong answers</p>
                    <p>🏆 Compete for the layout rank</p>
                </div>
                <PremiumButton onClick={enterArena} size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 border-none hover:scale-110 transition-transform shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                    FIGHT <Zap className="ml-2 h-5 w-5" />
                </PremiumButton>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto space-y-12">
            {/* HUD */}
            <div className="flex w-full justify-between items-end px-4">
                <div className="text-left">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Target</span>
                    <div className="text-2xl font-black text-red-100">{score} / {ARENA_GOAL}</div>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div className={cn("text-4xl font-mono font-black tracking-tighter", penaltyTime > 0 ? "text-red-500 animate-pulse" : "text-white")}>
                        {formatTime(elapsedTime)}
                    </div>
                    {penaltyTime > 0 && <span className="text-xs text-red-500 font-bold">+{penaltyTime}s PENALTY</span>}
                </div>

                <div className="text-right">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Streak</span>
                    <div className="text-2xl font-black text-red-100">🔥 {questionCount - 1}</div>
                </div>
            </div>

            {/* Question */}
            <div className="relative w-full">
                <div className="absolute inset-0 bg-red-600/20 blur-[80px] rounded-full animate-pulse" />
                <GlassCard className="relative p-16 flex flex-col items-center space-y-8 border-red-500/30 bg-black/60 backdrop-blur-3xl shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                    {question && (
                        <div className="text-7xl md:text-9xl font-black tracking-tighter text-white flex items-center gap-6">
                            <span>{question.operands[0]}</span>
                            <span className="text-red-500">{question.operator}</span>
                            <span>{question.operands[1]}</span>
                        </div>
                    )}
                    <input
                        ref={inputRef}
                        type="number"
                        value={tempAnswer ?? ''}
                        onChange={handleChange}
                        className="w-full max-w-[240px] bg-transparent text-center text-6xl md:text-8xl font-bold outline-none text-red-100 placeholder:text-red-900/20"
                        autoFocus
                    />
                </GlassCard>
            </div>
        </div>
    );
}
