import { formatCurrency, formatPercent } from "@/tools/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { Download } from "lucide-react";
import { exportRevenueToCSV } from "@/tools/csvExport";

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
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Revenue Breakdown</CardTitle>
                        <CardDescription>{data.financial_year}</CardDescription>
                    </div>
                    <button
                        type="button"
                        onClick={() => exportRevenueToCSV(data)}
                        className="flex items-center gap-1.5 h-7 px-2.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                        title="Export Revenue Breakdown to CSV"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export CSV</span>
                    </button>
                </div>
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
