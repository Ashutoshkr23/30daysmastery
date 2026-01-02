'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { Check, ChevronRight, GraduationCap, Clock, Target, Rocket, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for our onboarding data
type OnboardingData = {
    goal: string
    level: string
    hours: number
}

const STEPS = [
    { id: 1, title: 'Choose Your Goal', subtitle: "What are you preparing for?" },
    { id: 2, title: 'Current Level', subtitle: "Be honest, this helps us personalize." },
    { id: 3, title: 'Daily Commitment', subtitle: "Consistency beats intensity." },
    { id: 4, title: 'Analyzing...', subtitle: "Building your mastery path." },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [data, setData] = useState<OnboardingData>({
        goal: '',
        level: '',
        hours: 2,
    })

    const handleNext = () => {
        if (step < 4) {
            setStep(prev => prev + 1)
        }
    }

    // Simulate API call and redirect
    const handleComplete = async () => {
        // Here we would save to Supabase
        await new Promise(resolve => setTimeout(resolve, 2000))
        router.push('/dashboard')
    }

    // Auto-trigger completion when reaching step 4
    if (step === 4) {
        handleComplete()
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 -left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] opacity-40 animate-pulse" />
                <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] opacity-40" />
            </div>

            {/* Progress Bar (Top) */}
            <div className="w-full h-1 bg-white/5 relative z-50">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            {/* Header (Mobile Compact) */}
            <div className="px-6 pt-8 pb-4 text-center relative z-10 w-full max-w-lg mx-auto">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                        {STEPS[step - 1].title}
                    </h1>
                    <p className="text-muted-foreground">{STEPS[step - 1].subtitle}</p>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-lg mx-auto pb-32">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <StepOneGoal
                            selected={data.goal}
                            onSelect={(val) => setData({ ...data, goal: val })}
                        />
                    )}
                    {step === 2 && (
                        <StepTwoLevel
                            selected={data.level}
                            onSelect={(val) => setData({ ...data, level: val })}
                        />
                    )}
                    {step === 3 && (
                        <StepThreeCommitment
                            hours={data.hours}
                            onChange={(val) => setData({ ...data, hours: val })}
                        />
                    )}
                    {step === 4 && (
                        <StepFourLoading />
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls (Mobile Friendly) */}
            {step < 4 && (
                <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
                    <div className="max-w-lg mx-auto">
                        <PremiumButton
                            size="lg"
                            className="w-full h-14 text-lg shadow-2xl shadow-primary/20"
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !data.goal) ||
                                (step === 2 && !data.level)
                            }
                        >
                            Continue <ChevronRight className="ml-2 w-5 h-5" />
                        </PremiumButton>
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * Step 1: Goal Selection
 */
function StepOneGoal({ selected, onSelect }: { selected: string, onSelect: (v: string) => void }) {
    const goals = [
        { id: 'bank', label: "Bank PO/Clerk", icon: Target, desc: "IBPS, SBI, RRB" },
        { id: 'ssc', label: "SSC Exams", icon: GraduationCap, desc: "CGL, CHSL, MTS" },
        { id: 'regulatory', label: "Regulatory Bodies", icon: ShieldCheck, desc: "RBI Grade B, NABARD" }, // Using ShieldCheck as placeholder
    ]

    // Determine ShieldCheck replacement if needed later, using generic for now
    function ShieldCheck(props: any) {
        return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-4"
        >
            {goals.map((item) => (
                <GlassCard
                    key={item.id}
                    className={cn(
                        "p-6 cursor-pointer transition-all duration-300 border-2",
                        selected === item.id
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-transparent hover:bg-white/5 hover:border-white/10"
                    )}
                    onClick={() => onSelect(item.id)}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                            selected === item.id ? "bg-primary text-white" : "bg-white/5 text-muted-foreground"
                        )}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className={cn("text-lg font-bold", selected === item.id ? "text-primary" : "text-foreground")}>
                                {item.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        {selected === item.id && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check className="w-6 h-6 text-primary" />
                            </motion.div>
                        )}
                    </div>
                </GlassCard>
            ))}
        </motion.div>
    )
}

/**
 * Step 2: Level Selection
 */
function StepTwoLevel({ selected, onSelect }: { selected: string, onSelect: (v: string) => void }) {
    const levels = [
        { id: 'beginner', label: "Beginner", desc: "Starting from scratch" },
        { id: 'intermediate', label: "Intermediate", desc: "Know basics, need speed" },
        { id: 'advanced', label: "Advanced", desc: "Targeting rank 1" },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-4"
        >
            {levels.map((item) => (
                <GlassCard
                    key={item.id}
                    className={cn(
                        "p-6 cursor-pointer transition-all duration-300 border-2",
                        selected === item.id
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-transparent hover:bg-white/5 hover:border-white/10"
                    )}
                    onClick={() => onSelect(item.id)}
                >
                    <div className="flex flex-col text-left">
                        <h3 className={cn("text-lg font-bold", selected === item.id ? "text-primary" : "text-foreground")}>
                            {item.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                </GlassCard>
            ))}
        </motion.div>
    )
}

/**
 * Step 3: Commitment Slider
 */
function StepThreeCommitment({ hours, onChange }: { hours: number, onChange: (v: number) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-8 py-8"
        >
            <div className="text-center space-y-2">
                <div className="text-6xl font-black text-primary flex items-end justify-center">
                    {hours}<span className="text-xl font-medium text-muted-foreground mb-4 ml-1">hrs/day</span>
                </div>
                <p className="text-sm text-muted-foreground">Recommended: 2+ hours</p>
            </div>

            <div className="px-4">
                <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={hours}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Casual (1h)</span>
                    <span>Serious (4h)</span>
                    <span>Warrior (8h)</span>
                </div>
            </div>

            <GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/20 text-yellow-500 flex items-start gap-3">
                <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">
                    Based on your goal, spending <strong>{hours} hours</strong> daily gives you a <strong>{Math.min(hours * 15, 95)}%</strong> success probability.
                </p>
            </GlassCard>
        </motion.div>
    )
}

/**
 * Step 4: Loading State
 */
function StepFourLoading() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center space-y-8"
        >
            <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-primary animate-pulse" />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-medium">Personalizing Experience...</h3>
                <p className="text-muted-foreground text-sm">Aligning quizzes with your exam pattern</p>
            </div>
        </motion.div>
    )
}
