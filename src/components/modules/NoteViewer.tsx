import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface NoteViewerProps {
    content: string;
}

export default function NoteViewer({ content }: NoteViewerProps) {
    return (
        <GlassCard intensity="low" className="p-1">
            <article className="prose prose-slate dark:prose-invert max-w-none p-6 w-full prose-headings:text-primary prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-foreground">
                <div className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                    {content}
                </div>
            </article>
        </GlassCard>
    );
}
