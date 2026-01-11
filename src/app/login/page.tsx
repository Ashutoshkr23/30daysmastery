'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { Loader2, ArrowRight, ShieldCheck, Zap, Users, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)
        const supabase = createClient()
        const origin = window.location.origin

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        })

        if (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex md:grid md:grid-cols-2 overflow-hidden relative">

            {/* AMBIENCE LAYER (Global) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px] opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
            </div>

            {/* LEFT PANEL: Branding & Vision (Visible on Mobile now too, but styled differently) */}
            <div className="hidden md:flex relative flex-col justify-between p-12 lg:p-16 border-r border-white/5 bg-gradient-to-br from-primary/5 via-background to-background">

                {/* Desktop Logo (Absolute Top Left) */}
                <div className="absolute top-8 left-8 flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                        30
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        DaysMastery
                    </span>
                </div>

                {/* Desktop Content Container */}
                <div className="space-y-12 mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6 shadow-[0_0_15px_-3px_rgba(124,58,237,0.5)]">
                            <Sparkles className="w-3 h-3" />
                            <span>Premium Learning Experience</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.1]">
                            Master Your <br /> Dream Exam.
                        </h1>
                        <p className="text-lg text-muted-foreground/80 max-w-md leading-relaxed">
                            Join 2,000+ disciplined aspirants who have transformed their preparation with our scientifically designed daily challenges.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                        {[
                            { icon: Zap, label: "Daily Targets", desc: "Scientific schedule" },
                            { icon: Users, label: "Community", desc: "Top 1% aspirants" },
                            { icon: ShieldCheck, label: "Verified Data", desc: "Trusted sources" },
                        ].map((item, i) => (
                            <GlassCard key={i} intensity="low" className="p-4 flex flex-col gap-2 group hover:bg-white/5 transition-colors">
                                <div className="p-2 bg-primary/10 w-fit rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold block text-white/90">{item.label}</span>
                                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                <div className="text-sm text-muted-foreground/40 font-medium">
                    © 2026 30 Days Mastery. All rights reserved.
                </div>
            </div>

            {/* RIGHT PANEL: Login Form (Centerpiece) */}
            <div className="relative z-10 flex flex-col items-center justify-center p-6 w-full min-h-screen">

                {/* Mobile Branding (Only visible on mobile) */}
                <div className="md:hidden w-full max-w-sm mb-8 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* Official Logo Block */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary/30">
                                30
                            </div>
                            <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                                DaysMastery
                            </span>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            <span>Premium Learning Environment</span>
                        </div>
                    </motion.div>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-sm"
                >
                    <GlassCard className="p-1 space-y-0 backdrop-blur-3xl border-white/10 shadow-2xl overflow-hidden rounded-3xl">
                        <div className="p-8 space-y-8 bg-black/20">

                            <div className="text-center space-y-1">
                                <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
                                <p className="text-sm text-muted-foreground">Sign in to continue your progress</p>
                            </div>

                            <div className="space-y-4">
                                <PremiumButton
                                    size="lg"
                                    className="w-full relative h-14 text-base font-medium group overflow-hidden rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20"
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                    {isLoading ? (
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    ) : (
                                        <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                        </svg>
                                    )}
                                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                                </PremiumButton>
                            </div>

                            <div className="pt-2 text-center">
                                <p className="text-[10px] text-muted-foreground/50 px-4 leading-tight">
                                    By clicking continue, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>

                        {/* Card Footer/Decoration */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                    </GlassCard>
                </motion.div>

                {/* Mobile Footer Links */}
                <div className="md:hidden mt-8 text-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
