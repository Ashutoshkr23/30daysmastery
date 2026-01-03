import { GlassCard } from "@/components/ui/GlassCard";
import { Trophy, Zap, Flame, Star, Target, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: "trophy" | "zap" | "flame" | "star" | "target" | "crown";
    color: string;
    unlockedAt?: string;
}

const ICONS = {
    trophy: Trophy,
    zap: Zap,
    flame: Flame,
    star: Star,
    target: Target,
    crown: Crown,
};

export const BadgeCard = ({ badge, locked = false }: { badge: Badge; locked?: boolean }) => {
    const Icon = ICONS[badge.icon];

    return (
        <GlassCard
            variant={locked ? "static" : "interactive"}
            intensity={locked ? "low" : "medium"}
            className={cn(
                "p-4 flex flex-col items-center text-center gap-3 relative transition-all duration-300",
                locked && "opacity-50 grayscale"
            )}
        >
            <div
                className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                    locked ? "bg-muted text-muted-foreground" : `bg-gradient-to-br ${badge.color} text-white`
                )}
            >
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h4 className="font-bold text-sm tracking-tight">{badge.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
            </div>

            {!locked && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
        </GlassCard>
    );
};

export const BadgesGrid = ({ badges }: { badges: Badge[] }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} locked={!badge.unlockedAt} />
            ))}
        </div>
    );
};
