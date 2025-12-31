"use client";

import { useState, useEffect } from "react";
import { Quiz, Question } from "@/types/quiz";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Timer, ArrowRight, RefreshCcw } from "lucide-react";
import { useProgressStore } from "@/store/progress-store";

interface QuizRunnerProps {
    quiz: Quiz;
    courseId: string;
    dayId: number;
}

export default function QuizRunner({ quiz, courseId, dayId }: QuizRunnerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(quiz.timeLimitMinutes * 60);

    const { saveQuizScore } = useProgressStore();

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    // Timer Logic
    useEffect(() => {
        if (showResults || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setShowResults(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showResults, timeLeft]);

    // Save score when results are shown
    useEffect(() => {
        if (showResults) {
            saveQuizScore(quiz.id, score);
        }
    }, [showResults, quiz.id, score, saveQuizScore]);

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === currentQuestion.correctAnswerIndex) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setShowResults(true);
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (showResults) {
        const percentage = Math.round((score / quiz.questions.length) * 100);

        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center animate-in fade-in-50">
                <div className="rounded-full bg-primary/10 p-6">
                    <span className="text-4xl">🏆</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Quiz Completed!</h2>
                    <p className="text-muted-foreground">You scored {score} out of {quiz.questions.length}</p>
                </div>

                <div className="flex items-center justify-center h-32 w-32 rounded-full border-8 border-primary/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-3xl text-primary">
                        {percentage}%
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Retake Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Quiz Header */}
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground">Question</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-foreground">
                        {currentQuestionIndex + 1}/{quiz.questions.length}
                    </span>
                </div>
                <div className={cn("flex items-center gap-2 font-mono font-medium", timeLeft < 60 ? "text-destructive" : "text-primary")}>
                    <Timer className="h-4 w-4" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold leading-relaxed mb-6">
                    {currentQuestion.text}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedOption === index;
                        const isCorrect = index === currentQuestion.correctAnswerIndex;

                        // Logic for highlighting after answer
                        let borderClass = "border-input hover:bg-accent/50";
                        let icon = null;

                        if (isAnswered) {
                            if (isCorrect) {
                                borderClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                icon = <CheckCircle2 className="h-5 w-5 text-green-600" />;
                            } else if (isSelected) {
                                borderClass = "border-destructive bg-destructive/10 text-destructive";
                                icon = <XCircle className="h-5 w-5 text-destructive" />;
                            } else {
                                borderClass = "border-input opacity-50";
                            }
                        } else if (isSelected) {
                            borderClass = "border-primary ring-1 ring-primary";
                        }

                        return (
                            <button
                                key={index}
                                disabled={isAnswered}
                                onClick={() => handleOptionSelect(index)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all active:scale-[0.99]",
                                    borderClass
                                )}
                            >
                                <span className="font-medium">{option}</span>
                                {icon}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Explanation & Next Button */}
            {isAnswered && (
                <div className="animate-in fade-in-50 slide-in-from-bottom-2 space-y-4">
                    {currentQuestion.explanation && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900">
                            <span className="font-semibold block mb-1">Explanation:</span>
                            {currentQuestion.explanation}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                        >
                            {isLastQuestion ? "Finish Quiz" : "Next Question"}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
