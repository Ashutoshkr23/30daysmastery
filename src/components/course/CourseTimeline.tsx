"use client";

import Link from 'next/link';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { PlayCircle, FileText, CheckCircle2, Lock, HelpCircle } from 'lucide-react';
import { useProgressStore } from '@/store/progress-store';
import { GlassCard } from '@/components/ui/GlassCard';

interface CourseTimelineProps {
    course: Course;
}

export default function CourseTimeline({ course }: CourseTimelineProps) {
    const { completedDays } = useProgressStore();

    return (
        <div className="relative space-y-8 pl-8 sm:pl-10">
            {/* Vertical Line */}
            <div className="absolute left-[19px] sm:left-[23px] top-6 h-[calc(100%-40px)] w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

            {course.days.map((day, index) => {
                const isCompleted = completedDays[`${course.id}-${day.day}`];
                // For MVP, we unlock the next day if previous is completed, or if it's day 1
                const isLocked = false;

                return (
                    <div key={day.day} className="relative animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                        {/* Timeline Dot */}
                        <div
                            className={cn(
                                "absolute -left-[34px] sm:-left-[39px] top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background transition-all duration-300",
                                isCompleted
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                    : isLocked
                                        ? "bg-muted text-muted-foreground"
                                        : "bg-gradient-to-br from-primary to-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : isLocked ? (
                                <Lock className="h-3.5 w-3.5" />
                            ) : (
                                <span className="text-xs font-bold">{day.day}</span>
                            )}
                        </div>

                        {/* Day Card */}
                        <Link href={isLocked ? "#" : `/courses/${course.id}/day/${day.day}`}>
                            <GlassCard
                                variant={isLocked ? "static" : "interactive"}
                                gradientBorder={!isLocked && !isCompleted}
                                className={cn(
                                    "p-6 transition-all",
                                    isLocked && "opacity-50 grayscale cursor-not-allowed",
                                    !isLocked && !isCompleted && "ring-1 ring-primary/20 bg-primary/5"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <h3 className={cn("font-bold text-xl leading-tight font-heading tracking-tight", isCompleted && "text-muted-foreground line-through decoration-primary/50")}>
                                            {day.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                            {day.description || "Master the concepts of speed mathematics."}
                                        </p>
                                    </div>

                                    {isCompleted && (
                                        <span className="shrink-0 rounded-full bg-green-500/10 dark:bg-green-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                            Done
                                        </span>
                                    )}
                                </div>

                                {/* Modules Badges - Premium Glass Chips */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {day.video && (
                                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors">
                                            <PlayCircle className="h-3.5 w-3.5" />
                                            Video
                                        </div>
                                    )}
                                    {day.notes && (
                                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors">
                                            <FileText className="h-3.5 w-3.5" />
                                            Notes
                                        </div>
                                    )}
                                    {day.practice && (
                                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-colors">
                                            <HelpCircle className="h-3.5 w-3.5" />
                                            Practice
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}

