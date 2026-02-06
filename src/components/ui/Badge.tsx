import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'live' | 'default' | 'outline' | 'waitlist' | 'ocean' | 'success' | 'info';
    className?: string;
    animate?: boolean;
}

export function Badge({ children, variant = 'default', className, animate }: BadgeProps) {
    const variants = {
        default: "bg-white/10 text-zinc-200 border border-white/10",
        live: "bg-red-500/10 text-red-400 border border-red-500/20",
        waitlist: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        outline: "border border-white/10 text-zinc-400",
        ocean: "bg-theme-primary/10 text-theme-primary border border-theme-primary/20 shadow-[0_0_15px_-3px_var(--theme-primary)]",
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        info: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    };

    return (
        <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium tracking-wide ",
            variants[variant],
            animate && "animate-pulse",
            className
        )}>
            {variant === 'live' && (
                <span className="mr-2 flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            )}
            {children}
        </span>
    );
}
