"use client";

import { useState } from "react";
import { PracticeConfig } from "@/types/course";
import { PracticeRunner, SessionStats } from "./PracticeRunner";
import { PracticeResult } from "./PracticeResult";

interface ConceptPracticeProps {
    config: PracticeConfig;
    title: string;
    onClose: () => void;
    onComplete: (score: number, total: number, timeTaken: number) => void;
}

type ViewState = "RUNNING" | "RESULT";

export function ConceptPractice({ config, title, onClose, onComplete }: ConceptPracticeProps) {
    const [view, setView] = useState<ViewState>("RUNNING");
    const [stats, setStats] = useState<SessionStats | null>(null);

    const handleSessionComplete = (s: SessionStats) => {
        setStats(s);
        setView("RESULT");
    };

    const handleExit = () => {
        if (stats) {
            onComplete(stats.score, stats.total, stats.timeTaken);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            {view === "RUNNING" && (
                <div className="w-full max-w-4xl relative">
                    <div className="absolute top-0 right-0 z-10 p-4">
                        <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors text-sm uppercase tracking-widest">
                            Close
                        </button>
                    </div>
                    <PracticeRunner
                        generatorIds={[config.generator]}
                        generatorConfig={config.config}
                        config={{
                            id: 'concept-practice',
                            title: title,
                            description: '',
                            generatorId: config.generator,
                            targetCount: config.questionCount || 10,
                            // If needed, map timeLimit here if PracticeRunner supports it via config
                        }}
                        onComplete={handleSessionComplete}
                        onExit={onClose}
                    />
                </div>
            )}

            {view === "RESULT" && stats && (
                <PracticeResult
                    stats={stats}
                    isPass={stats.score >= (config.passingScore || 0)}
                    config={{ title, targetCount: config.questionCount || 10 }}
                    onRetry={() => setView("RUNNING")}
                    onExit={handleExit}
                />
            )}
        </div>
    );
}
