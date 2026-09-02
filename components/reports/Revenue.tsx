import { formatCurrency, formatPercent } from "@/tools/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
interface RevenueData {
    group_total_revenue: number;
    breakdown: {
        division: string;
        revenue: number;
    }[];
    financial_year: string;
    currency: string;
    warning: string | null;
}

export function RevenueReport({ data }: { data: RevenueData }) {
    return (
        <Card className="h-full rounded">
            <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>{data.financial_year}</CardDescription>
            </CardHeader>
            <CardContent className="p-1 sm:p-1">
                <div className="mb-2 flex flex-col">
                    <span className="text-xs text-corporate-muted">Total Group Revenue</span>
                    <span className="font-semibold font-mono">{formatCurrency(data.group_total_revenue, data.currency)}</span>
                </div>

                <hr className="mb-2 border-black/10" />

                <div className="space-y-2">
                    {data.breakdown.map((item, idx) => {
                        const percent = data.group_total_revenue ? (item.revenue / data.group_total_revenue) : 0;
                        return (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm gap-4">
                                    <span className="font-medium">{item.division}</span>
                                    <span className="font-mono">{formatCurrency(item.revenue, data.currency)}</span>
                                </div>
                                <div className="h-2 w-full bg-corporate-secondary rounded overflow-hidden">
                                    <div
                                        className="h-full bg-corporate-primary rounded"
                                        style={{ width: `${percent * 100}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs text-corporate-muted">{formatPercent(percent)}</div>
                            </div>
                        );
                    })}
                </div>

                {data.warning && (
                    <div className="mt-6 p-3 bg-red-50 text-red-600 text-sm rounded flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{data.warning}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
