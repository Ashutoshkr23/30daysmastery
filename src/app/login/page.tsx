'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { Loader2, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react'
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
        <div className="min-h-screen grid md:grid-cols-2 bg-background overflow-hidden relative">

            {/* LEFT PANEL: Brand Showcase (Hidden on Mobile, Visible on Desktop) */}
            <div className="hidden md:flex relative flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden border-r border-white/5">
                {/* Background Ambience */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-8 mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Premium Learning Experience
                        </div>
                        <h1 className="text-5xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Master Your Exam <br /> in 30 Days.
                        </h1>
                        <p className="text-lg text-muted-foreground/80 max-w-md leading-relaxed">
                            Join 2,000+ disciplined aspirants who have transformed their preparation with our scientifically designed daily challenges.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        {[
                            { icon: Zap, label: "Daily Targets" },
                            { icon: Users, label: "Community" },
                            { icon: ShieldCheck, label: "Verified Data" },
                        ].map((item, i) => (
                            <GlassCard key={i} intensity="low" className="p-4 flex items-center gap-3">
                                <item.icon className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-sm text-muted-foreground/50">
                    © 2024 30 Days Mastery. All rights reserved.
                </div>
            </div>

            {/* RIGHT PANEL: Login Form (Mobile First Centerpiece) */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative w-full h-full">
                {/* Mobile Background Ambience */}
                <div className="md:hidden absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-primary/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-40" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] opacity-40" />
                </div>

                {/* Mobile Header */}
                <div className="md:hidden absolute top-8 w-full px-6 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="h-10 w-10 bg-gradient-to-tr from-primary to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                        30
                    </div>
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Back to Home
                    </Link>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to continue your progress</p>
                    </div>

                    <GlassCard className="p-8 space-y-6 backdrop-blur-2xl border-white/10 shadow-2xl">
                        <div className="space-y-4">
                            <PremiumButton
                                size="lg"
                                className="w-full relative h-12 text-base group overflow-hidden"
                                onClick={handleLogin}
                                disabled={isLoading}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                )}
                                {isLoading ? 'Connecting...' : 'Continue with Google'}
                            </PremiumButton>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-muted/20" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background/0 px-2 text-muted-foreground">
                                        Secure Access
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-center text-muted-foreground/60 px-4">
                                By clicking continue, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    )
}
