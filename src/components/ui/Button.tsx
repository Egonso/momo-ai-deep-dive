import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'signal' | 'ghost' | 'outline' | 'danger' | 'ocean';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'ocean', size = 'md', fullWidth, isLoading, children, ...props }, ref) => {

        // Increased base tap target for mobile optimization
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

        const variants = {
            signal: "bg-theme-primary text-black hover:bg-theme-primary/90 shadow-lg shadow-theme-primary/20",
            ocean: "bg-theme-primary text-ocean-depth hover:bg-theme-secondary hover:text-white water-glow font-bold", // New Primary
            ghost: "hover:bg-white/5 text-zinc-400 hover:text-white",
            outline: "border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 hover:border-white/20",
            danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
        };

        const sizes = {
            sm: "h-10 px-4 text-xs", // Minimal touch target 40px
            md: "h-12 px-6 text-sm", // Standard 48px
            lg: "h-14 px-8 text-base tracking-wide" // Big actions
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
