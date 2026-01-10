"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProgressStore } from "@/store/progress-store";
import { Zap, Trophy, Flame, ChevronRight, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { createClient } from "@/lib/supabase/client";
import { initializeUserMetrics, trackPageView } from "@/lib/analytics";

import { BadgesView } from "@/components/modules/BadgesView";

// Course data with day information
import speedMathsData from "@/data/courses/speed-maths.json";

type CourseData = {
    id: string;
    title: string;
    description: string;
    progress: number;
    color: string;
    icon: typeof Zap;
    stats: { lessons: number; quizzes: number };
    totalDays: number;
};

type ResumeInfo = {
    dayId: number;
    dayTitle: string;
    dayDescription: string;
    completionPercent: number;
    courseTitle: string;
};

export default function Dashboard() {
    const { streak, totalXp } = useProgressStore();
    const [user, setUser] = useState<any>(null);
    const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
    const [courses, setCourses] = useState<CourseData[]>([
        {
            id: "speed-maths",
            title: "Speed Maths Mastery",
            description: "Master calculation tricks in 30 days",
            progress: 0,
            color: "from-blue-600 to-indigo-600",
            icon: Zap,
            stats: { lessons: 3, quizzes: 2 },
            totalDays: 30
        },
        // {
        //     id: "english-rules",
        //     title: "English Grammar Rules",
        //     description: "Crack error spotting like a pro",
        //     progress: 0,
        //     color: "from-purple-600 to-pink-600",
        //     icon: Trophy,
        //     stats: { lessons: 1, quizzes: 1 },
        //     totalDays: 30
        // },
    ]);

    useEffect(() => {
        const fetchUserAndProgress = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Initialize analytics
                await initializeUserMetrics();
                await trackPageView('/dashboard');

                // Fetch actual progress from server actions
                try {
                    const progressActions = await import("@/lib/actions/progress");

                    // Fetch progress for each course
                    const [speedMathsProgress, englishProgress] = await Promise.all([
                        progressActions.getCourseProgress("speed-maths", 30),
                        progressActions.getCourseProgress("english-rules", 30),
                    ]);

                    // Update course progress
                    setCourses(prev => prev.map(course => {
                        if (course.id === "speed-maths") return { ...course, progress: speedMathsProgress };
                        if (course.id === "english-rules") return { ...course, progress: englishProgress };
                        return course;
                    }));

                    // Get last active day for the "Continue Learning" card
                    const lastActiveDay = await progressActions.getLastActiveDay("speed-maths");

                    // Get day info from course data
                    const dayData = speedMathsData.days.find((d: any) => d.day === lastActiveDay.dayId);

                    const getConceptTitle = (concept: any) => {
                        if (!concept) return null;
                        return Array.isArray(concept) ? concept[0]?.title : concept.title;
                    };

                    setResumeInfo({
                        dayId: lastActiveDay.dayId,
                        dayTitle: dayData?.title || `Day ${lastActiveDay.dayId}`,
                        dayDescription: getConceptTitle(dayData?.content?.concept) || "Continue your learning journey",
                        completionPercent: lastActiveDay.completionPercent,
                        courseTitle: "Speed Maths Mastery"
                    });
                } catch (error) {
                    console.error("Failed to fetch progress:", error);
                    // Set default resume info
                    const dayData = speedMathsData.days[0];

                    const getConceptTitle = (concept: any) => {
                        if (!concept) return null;
                        return Array.isArray(concept) ? concept[0]?.title : concept.title;
                    };

                    setResumeInfo({
                        dayId: 1,
                        dayTitle: dayData?.title || "Day 1",
                        dayDescription: getConceptTitle(dayData?.content?.concept) || "Start your journey",
                        completionPercent: 0,
                        courseTitle: "Speed Maths Mastery"
                    });
                }
            }
        };
        fetchUserAndProgress();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-24 p-4 space-y-8 animate-in fade-in-50 duration-500">
            {/* Header */}
            <header className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                        Hello, {user?.user_metadata?.full_name?.split(' ')[0] || "Aspirant"}! 👋
                    </h1>
                    <p className="text-muted-foreground font-medium">Ready to conquer your goals?</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-sm backdrop-blur-sm">
                    <Flame className="h-5 w-5 fill-current animate-pulse" />
                    <span className="font-bold">{streak} Day Streak</span>
                </div>
            </header>

            {/* Achievements Section */}
            <section>
                <div className="flex items-center gap-2 mb-5">
                    <h2 className="text-xl font-bold">Hall of Fame</h2>
                </div>
                <BadgesView />
            </section>

            {/* Continue Learning Hero Card */}
            {resumeInfo && (
                <Link href={`/courses/speed-maths/day/${resumeInfo.dayId}`} className="block group">
                    <GlassCard
                        intensity="medium"
                        gradientBorder
                        className="p-6 relative overflow-visible transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
                    >
                        <div className="absolute -top-3 -right-3">
                            <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce delay-700">
                                RESUME DAY {resumeInfo.dayId}
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-3 text-primary ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <PlayCircle className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1">{resumeInfo.courseTitle}</span>
                                    <h3 className="font-bold text-xl leading-tight">{resumeInfo.dayTitle}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {resumeInfo.dayDescription}
                                </p>

                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${resumeInfo.completionPercent}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{resumeInfo.completionPercent}% Complete</span>
                                </div>

                                <div className="mt-4 flex gap-3">
                                    <PremiumButton size="sm" className="w-full group-hover:shadow-primary/50">
                                        Continue Learning
                                    </PremiumButton>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </Link>
            )}

            {/* Courses Section */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold">My Active Challenges</h2>
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
