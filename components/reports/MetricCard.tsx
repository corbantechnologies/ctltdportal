import { formatCurrency } from "@/tools/format";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: number;
    currency?: string;
    trend?: number; // percent change if available
    description?: string;
    icon?: React.ElementType;
    className?: string;
}

export function MetricCard({ title, value, currency = "KES", trend, description, icon: Icon, className }: MetricCardProps) {
    const isPositive = value >= 0;

    return (
        <Card className={cn("relative overflow-hidden rounded", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-80">{title}</CardTitle>
                {Icon ? (
                    <Icon className="h-4 w-4 text-corporate-muted" />
                ) : (
                    <DollarSignIcon className="h-4 w-4 text-corporate-muted" />
                )}
            </CardHeader>
            <CardContent>
                <div className={cn("font-mono tracking-tight break-words", value < 0 && "text-red-500")}>
                    {formatCurrency(value, currency)}
                </div>
                {description && (
                    <p className="text-xs text-corporate-muted mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
