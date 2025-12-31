import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Play, Pause, Volume2, Maximize2, SkipForward } from "lucide-react";

interface VideoPlayerProps {
    videoId: string;
    title: string;
    onComplete?: () => void;
}

export function VideoPlayer({ videoId, title, onComplete }: VideoPlayerProps) {
    // In a real app, this would wrap a YouTube player or HTML5 video
    // For MVP, we'll simulate a custom player interface

    return (
        <GlassCard intensity="high" className="overflow-hidden group relative aspect-video bg-black/90">
            {/* Video Placeholder (YouTube Embed would go here) */}
            <iframe
                className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                src={`https://www.youtube.com/embed/${videoId}?controls=0&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />

            {/* Custom Overlay (Simulated Premium Controls) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none px-6 py-4 flex flex-col justify-end">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-primary w-1/3 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                </div>

                <div className="flex items-center justify-between text-white pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <button className="hover:text-primary transition-colors"><Play className="h-6 w-6 fill-current" /></button>
                        <button className="hover:text-primary transition-colors"><SkipForward className="h-5 w-5" /></button>
                        <span className="text-xs font-medium opacity-80">14:20 / 45:00</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="hover:text-primary transition-colors"><Volume2 className="h-5 w-5" /></button>
                        <button className="hover:text-primary transition-colors"><Maximize2 className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>

            {/* Title Overlay (Top) */}
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <h3 className="text-white font-medium text-shadow-sm truncate">{title}</h3>
            </div>
        </GlassCard>
    );
}
