export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            {/* Simplified Layout - No Header/Footer to keep focus */}
            {children}
        </div>
    )
}
