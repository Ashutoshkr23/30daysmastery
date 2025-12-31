"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
    const pathname = usePathname();

    const links = [
        {
            href: "/dashboard",
            label: "Home",
            icon: Home,
        },
        {
            href: "/courses",
            label: "Explore",
            icon: BookOpen,
        },
        {
            href: "/profile",
            label: "Profile",
            icon: User,
        },
    ];

    // Hide on login/signup pages if needed, but for PWA, usually persistent
    if (pathname === '/login') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md pb-safe">
            <div className="flex items-center justify-around h-16">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
