import { getCourse } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import CourseTimeline from '@/components/course/CourseTimeline';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: PageProps) {
    const { courseId } = await params;
    const course = await getCourse(courseId);

    if (!course) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-20 overflow-x-hidden selection:bg-primary/20">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] opacity-30" />
            </div>

            {/* Course Header */}
            <div className="relative overflow-hidden bg-background/50 backdrop-blur-sm border-b border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

                <div className="relative px-6 pt-6 pb-12">
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Home
                    </Link>

                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {course.title}
                        </h1>
                        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Course Progress</span>
                            <span className="text-sm font-bold text-primary">{course.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-violet-400 shadow-[0_0_10px_rgba(124,58,237,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${course.progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline (Client Component for Dynamic State) */}
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <CourseTimeline course={course} />
            </div>
        </div>
    );
}
