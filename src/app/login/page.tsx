'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)
        const supabase = createClient()

        // Get the current origin URL dynamically (works for both localhost and prod)
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
        // No set loading false on success because we redirect away
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-40 animate-pulse" />
            <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] opacity-40" />

            <GlassCard className="w-full max-w-md p-8 text-center space-y-8">
                <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-primary to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 mb-4">
                        30
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to continue your mastery journey</p>
                </div>

                <div className="space-y-4">
                    <PremiumButton
                        size="lg"
                        className="w-full relative"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                        )}
                        {isLoading ? 'Connecting...' : 'Continue with Google'}
                    </PremiumButton>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background/0 backdrop-blur-xl px-2 text-muted-foreground">
                                Secure Authentication
                            </span>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
