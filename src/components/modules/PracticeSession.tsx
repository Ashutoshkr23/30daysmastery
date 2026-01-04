"use client";

import { useEffect, useState } from "react";
import { daysConfig, getGenerator, TaskConfig } from "@/lib/generators";
import { PracticeLobby, CustomSettings } from "./PracticeLobby";
import { PracticeRunner, SessionStats } from "./PracticeRunner";
import { PracticeResult } from "./PracticeResult";
import { logAttempt } from "@/lib/actions/progress";

interface PracticeSessionProps {
    dayId: number;
    onComplete?: (success: boolean, accuracy: number) => void;
}

type ViewState = "LOBBY" | "RUNNING" | "RESULT";

export function PracticeSession({ dayId, onComplete }: PracticeSessionProps) {
    const config = daysConfig[dayId];

    // State
    const [view, setView] = useState<ViewState>("LOBBY");

    // Session Config
    const [activeTaskIndex, setActiveTaskIndex] = useState(0); // For Linear
    const [activeTaskConfig, setActiveTaskConfig] = useState<TaskConfig | undefined>(undefined);
    const [customSettings, setCustomSettings] = useState<CustomSettings | undefined>(undefined);

    // Results
    const [lastStats, setLastStats] = useState<SessionStats | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    // TODO: Fetch this from DB/Local storage properly in a real app
    // For now, we track local session progress
    const [linearProgress, setLinearProgress] = useState(0);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                // Determine how many linear tasks are already "done"
                // We can't easily know EXACTLY which ones without a proper "user_task_progress" table
                // But we can approximate by checking if we have enough passed attempts? 
                // OR better: Just check `initialProgress` passed from DayView if it tracks "practice_score"?

                // User requirement: "Once I complete [linear], custom should open"
                // If the user has a passing practice_score (>=80), we can assume linear is done?
                // `DayView` sets `isPracticePassed` if score >= 80.

                // Let's defer to a prop or check attempts.
                // Checking attempts is safer.
                const attempts = await import("@/lib/actions/progress").then(m => m.getRecentAttempts('speed-maths', dayId));
                setHistory(attempts || []);

                // This is a naive check: if we have passed attempts equal to or greater than the number of tasks?
                // Or just check if we have roughly completed it.
                // For MVP, if we have > 0 passed attempts, let's assume progress. Use a proper ID check later.

                // BETTER STRATEGY: 
                // If any attempt has "passed" = true AND score >= last task target? 
                // Hard to correlate.

                // For now, let's just restore based on passed count, limited to max tasks.
                if (attempts && attempts.length > 0) {
                    const passedCount = attempts.filter((a: any) => a.passed).length;
                    // Restore progress, but cap it at max
                    setLinearProgress(Math.min(passedCount, config.linearTasks.length));
                }
            } catch (e) {
                console.error("Failed to sync progress", e);
            }
        };

        fetchProgress();
    }, [dayId, config.linearTasks.length]);

    if (!config) return <div className="p-8 text-center text-red-500">Configuration Error: Day {dayId} not found.</div>;

    const isLinearComplete = linearProgress >= config.linearTasks.length;

    // --- Actions ---

    const startLinearTask = (index: number) => {
        const task = config.linearTasks[index];
        if (!task) return;

        setActiveTaskConfig(task);
        setActiveTaskIndex(index);
        setCustomSettings(undefined);
        setView("RUNNING");
    };

    const startCustomSession = (settings: CustomSettings) => {
        setCustomSettings(settings);
        setActiveTaskConfig(undefined);
        setView("RUNNING");
    };

    const handleSessionComplete = async (stats: SessionStats) => {
        setLastStats(stats);

        // Determine Pass/Fail logic
        let passed = false;

        if (activeTaskConfig) {
            // Linear Mode: Pass if Target Reached AND Accuracy > 90% (Strict!)
            // Or just map it simpler: Score >= Target
            if (stats.score >= activeTaskConfig.targetCount) passed = true;
        } else {
            // Custom Mode: Always passed if finished? Or based on goals?
            passed = true;
        }

        setView("RESULT");

        // Save to DB
        try {
            await logAttempt({
                course_id: 'speed-maths',
                day_id: dayId,
                task_id: activeTaskConfig ? activeTaskConfig.id : customSettings?.generatorId, // Add task_id
                score: stats.score,
                total_questions: stats.total,
                accuracy: stats.accuracy,
                time_taken: stats.timeTaken,
                passed
            });

            // Update Progress if Linear
            if (passed && activeTaskConfig) {
                if (activeTaskIndex === linearProgress) {
                    setLinearProgress(prev => prev + 1);
                }
                // If last task done
                if (activeTaskIndex === config.linearTasks.length - 1 && onComplete) {
                    onComplete(true, stats.accuracy);
                }
            }

        } catch (e) {
            console.error("Failed to save attempt", e);
        }
    };

    const handleNext = () => {
        const nextIndex = activeTaskIndex + 1;
        if (nextIndex < config.linearTasks.length) {
            startLinearTask(nextIndex);
        } else {
            // All done
            setView("LOBBY");
        }
    };

    // --- Render ---

    return (
        <div className="w-full min-h-[500px] flex items-center justify-center">
            {view === "LOBBY" && (
                <PracticeLobby
                    config={config}
                    isLinearComplete={isLinearComplete}
                    onStartLinear={startLinearTask}
                    onStartCustom={startCustomSession}
                    attempts={history}
                />
            )}

            {view === "RUNNING" && (
                <PracticeRunner
                    generator={getGenerator(activeTaskConfig ? activeTaskConfig.generatorId : customSettings!.generatorId)}
                    config={activeTaskConfig}
                    customSettings={customSettings}
                    onComplete={handleSessionComplete}
                    onExit={() => setView("LOBBY")}
                />
            )}

            {view === "RESULT" && lastStats && (
                <PracticeResult
                    stats={lastStats}
                    isPass={activeTaskConfig ? lastStats.score >= activeTaskConfig.targetCount : true}
                    onRetry={() => activeTaskConfig ? startLinearTask(activeTaskIndex) : startCustomSession(customSettings!)}
                    onNext={activeTaskConfig && activeTaskIndex < config.linearTasks.length - 1 ? handleNext : undefined}
                    onExit={() => setView("LOBBY")}
                />
            )}
        </div>
    );
}
