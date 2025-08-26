import React from 'react';
import { cn } from "@/lib/utils";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'default' | 'outline';
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
    ({ children, className, variant = 'default', ...props }, ref) => {
        return (
            <div
                className={cn(
                    "rounded-xl p-6 transition-shadow", 
                    variant === 'default' && "bg-white shadow-md dark:bg-slate-800 hover:shadow-lg",
                    variant === 'outline' && "border-2 border-slate-200 dark:border-slate-700",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Box.displayName = "Box";

export { Box };