"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { createClient } from '@/lib/supabase/client';
import { UpgradeModal } from '@/components/monetization/UpgradeModal';

interface CourseTimelineProps {
    course: Course;
}

interface DayProgress {
    studyCompleted: boolean;
    practiceCompleted: boolean;
    arenaCompleted: boolean;
    percentage: number;
}

export default function CourseTimeline({ course }: CourseTimelineProps) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [dayProgress, setDayProgress] = useState<Record<number, DayProgress>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            const supabase = createClient();

            // Get user premium status
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', user.id)
                    .single();

                setIsPremium(profile?.is_premium || false);

                // Fetch progress for each day
                const progressData: Record<number, DayProgress> = {};

                for (const day of course.days) {
                    const { data: progress } = await supabase
                        .from('daily_progress')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('course_id', course.id)
                        .eq('day_id', day.day)
                        .single();

                    if (progress) {
                        const studyDone = progress.notes_status === 'completed';
                        const practiceDone = progress.practice_status === 'completed';
                        const arenaDone = progress.arena_status === 'completed';

                        const completed = [studyDone, practiceDone, arenaDone].filter(Boolean).length;
                        const percentage = Math.round((completed / 3) * 100);

                        progressData[day.day] = {
                            studyCompleted: studyDone,
                            practiceCompleted: practiceDone,
                            arenaCompleted: arenaDone,
                            percentage
                        };
                    } else {
                        progressData[day.day] = {
                            studyCompleted: false,
                            practiceCompleted: false,
                            arenaCompleted: false,
                            percentage: 0
                        };
                    }
                }

                setDayProgress(progressData);
            }
            setLoading(false);
        }

        fetchUserData();
    }, [course]);

    return (
        <div className="space-y-3">
            {course.days.map((day) => {
                const progress = dayProgress[day.day] || { studyCompleted: false, practiceCompleted: false, arenaCompleted: false, percentage: 0 };
                const isLocked = day.day > 3 && !isPremium;
                const isCompleted = progress.percentage === 100;

                return (
                    <div key={day.day} className="relative">
                        {isLocked ? (
                            <GlassCard className="p-4 opacity-60 cursor-not-allowed">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Day {day.day}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                                                PREMIUM
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-base leading-tight text-muted-foreground">
                                            {day.title}
                                        </h3>
                                    </div>
                                </div>

                                <PremiumButton
                                    size="sm"
                                    className="w-full mt-3"
                                    onClick={() => setShowUpgradeModal(true)}
                                >
                                    Upgrade to Premium
                                </PremiumButton>
                            </GlassCard>
                        ) : (
                            <Link href={`/courses/${course.id}/day/${day.day}`}>
                                <GlassCard
                                    variant="interactive"
                                    className={cn(
                                        "p-4 transition-all",
                                        isCompleted && "bg-green-500/5 border-green-500/20"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg",
                                            isCompleted
                                                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                                : "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : day.day}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Day {day.day}</span>
                                                {isCompleted && (
                                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold">
                                                        DONE
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={cn(
                                                "font-bold text-base leading-tight",
                                                isCompleted && "line-through text-muted-foreground"
                                            )}>
                                                {day.title}
                                            </h3>

                                            {/* Progress Bar */}
                                            {progress.percentage > 0 && progress.percentage < 100 && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-500"
                                                            style={{ width: `${progress.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted-foreground">{progress.percentage}%</span>
                                                </div>
                                            )}
                                        </div>

                                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </GlassCard>
                            </Link>
                        )}
                    </div>
                );
            })}
            <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
        </div>
    );
}
