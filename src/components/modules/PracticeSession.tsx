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
                const progressActions = await import("@/lib/actions/progress");

                // Fetch History for Display
                const attempts = await progressActions.getRecentAttempts('speed-maths', dayId);
                setHistory(attempts || []);

                // Fetch Completed Task IDs for Unlock Logic
                const completedIds = await progressActions.getCompletedTasks('speed-maths', dayId);

                // Calculate progress based on how many linear tasks have their ID in the completed set
                if (completedIds && config.linearTasks.length > 0) {
                    const completedCount = config.linearTasks.filter(task => completedIds.includes(task.id)).length;
                    setLinearProgress(completedCount);
                }
            } catch (e) {
                console.error("Failed to sync progress", e);
            }
        };

        fetchProgress();
    }, [dayId, config.linearTasks]);

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
