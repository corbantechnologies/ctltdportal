import { formatCurrency } from "@/tools/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { PnL } from "@/services/reports";
import { Download } from "lucide-react";
import { exportPnLToCSV } from "@/tools/csvExport";

export function PnLReport({ data }: { data: PnL }) {
    const Row = ({ label, value, bold = false, net = false }: { label: string; value: number; bold?: boolean; net?: boolean }) => (
        <div className={`flex justify-between items-center py-0.5 gap-4 ${bold ? "" : ""} ${net ? "bg-corporate-primary/5 px-2 rounded -mx-2" : ""}`}>
            <span className="text-sm">{label}</span>
            <span className={`font-mono text-sm ${value < 0 ? "text-red-500" : ""} ${net ? "text-corporate-primary" : ""}`}>
                {formatCurrency(value, data.currency)}
            </span>
        </div>
    );

    const displayDate = data.start_date && data.end_date 
        ? `${data.start_date} to ${data.end_date}` 
        : "Period Not Set";

    return (
        <Card className="h-full rounded">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Profit & Loss</CardTitle>
                        <CardDescription>{data.division} • {displayDate}</CardDescription>
                    </div>
                    <button
                        type="button"
                        onClick={() => exportPnLToCSV(data)}
                        className="flex items-center gap-1.5 h-7 px-2.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                        title="Export Profit & Loss to CSV"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </CardHeader>
            <CardContent className="space-y-1 p-1 sm:p-1">
                <Row label="Revenue" value={data.revenue} />
                <Row label="Cost of Sales" value={data.cost_of_sales} />
                <hr className="my-2 border-black/10" />
                <Row label="Gross Profit" value={data.gross_profit} bold />
                <Row label="Operating Expenses" value={data.operating_expenses} />
                <hr className="my-2 border-black/10" />
                <Row label="Operating Profit" value={data.operating_profit} bold />
                {data.other_income !== 0 && <Row label="Other Income" value={data.other_income} />}
                {data.non_operating_expense !== 0 && <Row label="Non-Operating Expense" value={data.non_operating_expense} />}
                {(data.other_income !== 0 || data.non_operating_expense !== 0) && <hr className="my-2 border-black/10" />}
                <Row label="Net Profit" value={data.net_profit} bold net />
            </CardContent>
        </Card>
    );
}
