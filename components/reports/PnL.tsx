import { formatCurrency } from "@/tools/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { PnL } from "@/services/reports";

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
                <CardTitle>Profit & Loss</CardTitle>
                <CardDescription>{data.division} • {displayDate}</CardDescription>
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
