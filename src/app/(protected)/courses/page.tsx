"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Zap, Trophy, ChevronRight, Lock, BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";

// Mock Data (Consistent with Dashboard for now)
const COURSES = [
    {
        id: "speed-maths",
        title: "Speed Maths Mastery",
        description: "Master calculation tricks in 30 days. Learn Vedic Maths, mental arithmetic, and shortcuts used by toppers.",
        tags: ["Quantitative Aptitude", "Calculation"],
        color: "from-blue-600 to-indigo-600",
        icon: Zap,
        stats: { lessons: 30, quizzes: 10, totalStudents: 1240 },
        isLocked: false
    },
    {
        id: "english-rules",
        title: "English Grammar Rules",
        description: "Crack error spotting like a pro. Comprehensive coverage of 100+ golden grammar rules for competitive exams.",
        tags: ["Verbal Ability", "Grammar"],
        color: "from-purple-600 to-pink-600",
        icon: Trophy,
        stats: { lessons: 25, quizzes: 15, totalStudents: 850 },
        isLocked: false
    },
    {
        id: "logical-reasoning",
        title: "Logical Reasoning Alpha",
        description: "Develop an unconquerable mindset for puzzles, seating arrangements, and syllogisms.",
        tags: ["Reasoning", "Logic"],
        color: "from-amber-500 to-orange-600",
        icon: BookOpen,
        stats: { lessons: 20, quizzes: 20, totalStudents: 560 },
        isLocked: true // Demo locked state
    },
];

export default function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = COURSES.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background pb-24 p-4 space-y-8 animate-in fade-in-50 duration-500">
            {/* Header section with Search */}
            <header className="space-y-6 pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-300 bg-clip-text text-transparent">
                        Explore Courses
                    </h1>
                    <p className="text-muted-foreground font-medium">Find your next challenge and level up.</p>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <GlassCard className="p-1 flex items-center relative z-10 overflow-hidden">
                        <div className="pl-4 text-muted-foreground">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for courses, skills, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-foreground placeholder-muted-foreground/70 h-12 px-4 outline-none"
                        />
                    </GlassCard>
                </div>
            </header>

            {/* Tags/Categories (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {["All", "Quantitative", "Verbal", "Reasoning", "General Knowledge"].map((tag, i) => (
                    <button
                        key={tag}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            i === 0
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                                : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 gap-5">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <Link
                            key={course.id}
                            href={course.isLocked ? "#" : `/courses/${course.id}`}
                            className={cn("block group", course.isLocked && "cursor-not-allowed opacity-80")}
                        >
                            <GlassCard
                                variant="hover"
                                className="relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] group-hover:-translate-y-1"
                            >
                                {/* Decorative Gradient Background */}
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.03] transition-opacity group-hover:opacity-[0.08]", course.color)} />

                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-4">
                                            {/* Badge/Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {course.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-sm">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Title & Description */}
                                            <div>
                                                <h3 className="font-bold text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                                                    {course.title}
                                                    {course.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                    {course.description}
                                                </p>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80">
                                                <span>{course.stats.lessons} Lessons</span>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                <span>{course.stats.totalStudents.toLocaleString()} Students</span>
                                            </div>
                                        </div>

                                        {/* Icon */}
                                        <div className={cn("shrink-0 rounded-2xl bg-gradient-to-br p-4 text-white shadow-xl group-hover:scale-110 transition-transform duration-500", course.color)}>
                                            <course.icon className="h-8 w-8" />
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-zinc-800" />
                                            ))}
                                            <div className="h-6 w-6 rounded-full ring-2 ring-background bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                                +1k
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "flex items-center gap-1 font-bold text-sm transition-colors",
                                            course.isLocked ? "text-muted-foreground" : "text-primary group-hover:text-primary/80"
                                        )}>
                                            {course.isLocked ? "Coming Soon" : "Start Learning"}
                                            {!course.isLocked && <ChevronRight className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No courses found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
