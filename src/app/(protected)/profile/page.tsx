"use client";

import { useProgressStore } from "@/store/progress-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { AnalyticsView } from "@/components/modules/AnalyticsView";
import { BadgesView } from "@/components/modules/BadgesView";
import { User, Settings, LogOut, Crown, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { totalXp, streak } = useProgressStore();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
    };

    // Calculate level based on XP (simple sqrt curve matching server logic)
    const level = Math.floor(Math.sqrt(totalXp / 100)) || 1;

    return (
        <div className="min-h-screen bg-background pb-24 p-4 space-y-8 animate-in fade-in-50 duration-500">
            {/* 1. Header & Identity */}
            <header className="relative mt-8 mb-12">
                {/* Banner/Background */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10 rounded-full" />

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl shadow-indigo-500/30">
                            <div className="h-full w-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border-4 border-white/10 overflow-hidden relative">
                                <User className="h-12 w-12 text-white/80" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-amber-400 flex items-center gap-1">
                            <Crown className="h-3 w-3 fill-current" />
                            Lvl {level}
                        </div>
                    </div>

                    {/* Stats & Info */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Aspirant
                        </h1>
                        <p className="text-muted-foreground font-medium">Joined January 2026</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="font-bold text-white">{totalXp} XP</span>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <Crown className="h-4 w-4 text-orange-400 fill-current" />
                                <span className="font-bold text-white">Rank #42</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <PremiumButton size="sm" variant="glass" onClick={() => { }} className="bg-white/5 hover:bg-white/10">
                            <Settings className="h-4 w-4 mr-2" /> Settings
                        </PremiumButton>
                        <PremiumButton size="sm" variant="glass" onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20">
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </PremiumButton>
                    </div>
                </div>
            </header>

            {/* 2. Deep Analytics "The Mirror" */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        The Mirror
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-indigo-500/20">Analytics</span>
                    </h2>
                </div>
                <GlassCard className="p-1">
                    <AnalyticsView />
                </GlassCard>
            </section>

            {/* 3. Hall of Fame "Badges" */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Hall of Fame
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-amber-500/20">Achievements</span>
                    </h2>
                </div>
                <BadgesView />
            </section>
        </div>
    );
}
