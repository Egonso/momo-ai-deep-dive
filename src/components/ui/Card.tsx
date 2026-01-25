import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    noPadding?: boolean;
}

export function Card({ children, className, noPadding, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "glass-panel rounded-2xl overflow-hidden",
                !noPadding && "p-6 md:p-8",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
