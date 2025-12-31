"use client";

import Link from "next/link";
import { useProgressStore } from "@/store/progress-store";
import { Zap, Trophy, Flame, ChevronRight, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";

export default function Dashboard() {
    const { streak, totalXp } = useProgressStore();

    const courses = [
        {
            id: "speed-maths",
            title: "Speed Maths Mastery",
            description: "Master calculation tricks in 30 days",
            progress: 10,
            color: "from-blue-600 to-indigo-600",
            icon: Zap,
            stats: { lessons: 3, quizzes: 2 }
        },
        {
            id: "english-rules",
            title: "English Grammar Rules",
            description: "Crack error spotting like a pro",
            progress: 5,
            color: "from-purple-600 to-pink-600",
            icon: Trophy,
            stats: { lessons: 1, quizzes: 1 }
        },
    ];

    return (
        <div className="min-h-screen bg-background pb-24 p-4 space-y-8 animate-in fade-in-50 duration-500">
            {/* Header */}
            <header className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                        Hello, Aspirant! 👋
                    </h1>
                    <p className="text-muted-foreground font-medium">Ready to conquer your goals?</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-sm backdrop-blur-sm">
                    <Flame className="h-5 w-5 fill-current animate-pulse" />
                    <span className="font-bold">{streak} Day Streak</span>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard variant="hover" intensity="low" className="p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Total XP
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-primary">{totalXp}</div>
                        <div className="text-xs text-muted-foreground mt-1">Points earned</div>
                    </div>
                </GlassCard>
                <GlassCard variant="hover" intensity="low" className="p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        Lessons
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-foreground">4</div>
                        <div className="text-xs text-muted-foreground mt-1">Completed</div>
                    </div>
                </GlassCard>
            </div>

            {/* Daily Goal Widget */}
            <GlassCard
                intensity="medium"
                gradientBorder
                className="p-6 relative overflow-visible"
            >
                <div className="absolute -top-3 -right-3">
                    <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                        DAILY GOAL
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">Keep the momentum! 🚀</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            Complete 1 lesson and 1 quiz today to maintain your {streak} day streak.
                        </p>
                        <div className="mt-4 flex gap-3">
                            <PremiumButton size="sm" className="w-full">
                                Continue Learning
                            </PremiumButton>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Courses Section */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold">Your Courses</h2>
                    <Link href="/courses" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        View All
                    </Link>
                </div>

                <div className="space-y-5">
                    {courses.map((course, index) => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.id}`}
                            className="block group"
                        >
                            <GlassCard
                                variant="hover"
                                className="relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                            >
                                {/* Decorative Gradient Background */}
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.03] transition-opacity group-hover:opacity-[0.08]", course.color)} />

                                <div className="p-6 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={cn("rounded-2xl bg-gradient-to-br p-3.5 text-white shadow-lg group-hover:scale-110 transition-transform duration-300", course.color)}>
                                                <course.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-0.5">{course.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                                            <span>Progress</span>
                                            <span className="text-foreground">{course.progress}%</span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/50">
                                            <div
                                                className={cn("h-full bg-gradient-to-r transition-all duration-1000 ease-out", course.color)}
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
