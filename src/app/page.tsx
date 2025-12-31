import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ArrowRight, BookOpen, Clock, Zap, Target, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-50 animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] opacity-50" />
      </div>

      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-white/10 text-sm font-medium animate-in fade-in zoom-in-50 delay-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            New: Speed Maths Challenge
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent drop-shadow-sm">
            Master Your Syllabus in <span className="text-primary">30 Days</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            The ultimate disciplined learning path for Banking & SSC aspirants.
            Break down overwhelming syllabi into manageable daily conquests.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
            <Link href="#courses">
              <PremiumButton size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                Start Learning
              </PremiumButton>
            </Link>
            <Link href="#methodology">
              <PremiumButton variant="outline" size="lg">
                How it Works
              </PremiumButton>
            </Link>
          </div>
        </div>

        {/* Statistics / Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-32">
          {[
            { label: "Active Learners", value: "2,000+" },
            { label: "Daily Quizzes", value: "150+" },
            { label: "Completion Rate", value: "94%" },
            { label: "Success Stories", value: "500+" },
          ].map((stat, i) => (
            <GlassCard key={i} intensity="low" className="p-6 text-center">
              <h3 className="text-2xl font-bold lg:text-3xl">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Featured Courses */}
        <div id="courses" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Featured Challenges</h2>
            <p className="text-muted-foreground">Choose your path to mastery</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Link href="/courses/speed-maths" className="group">
              <GlassCard variant="hover" gradientBorder className="h-full p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap className="h-48 w-48 -rotate-12" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Speed Maths</h3>
                    <p className="text-muted-foreground">
                      Master calculation tricks, approximations, and mental math in 30 days. Perfect for Banking prelims.
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm font-medium pt-4">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Clock className="h-4 w-4" /> 15 mins/day
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Target className="h-4 w-4" /> 1200+ Questions
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>

            <Link href="/courses/english-rules" className="group">
              <GlassCard variant="hover" gradientBorder className="h-full p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen className="h-48 w-48 -rotate-12" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">English Grammar Rules</h3>
                    <p className="text-muted-foreground">
                      Internalize the top 120 grammar rules repeated in SSC & Banking exams. No fluff, just marks.
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm font-medium pt-4">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Clock className="h-4 w-4" /> 10 mins/day
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Award className="h-4 w-4" /> 300+ Rules
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
