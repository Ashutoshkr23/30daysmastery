import { cn } from "@/lib/utils";

export const Skeleton = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50 dark:bg-white/5",
                className
            )}
            {...props}
        />
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px] rounded-2xl" />
                <Skeleton className="col-span-3 h-[400px] rounded-2xl" />
            </div>
        </div>
    );
};
