import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: boolean;
}

export function Card({ children, className, gradient, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded p-6 border",
                "bg-white/80 backdrop-blur-xl border-black/5 shadow-sm",
                gradient && "bg-gradient-to-br from-white via-white to-orange-50/30",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("font-semibold leading-none tracking-tight text-lg text-corporate-foreground", className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn("text-sm text-corporate-muted", className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("", className)} {...props}>
            {children}
        </div>
    );
}
