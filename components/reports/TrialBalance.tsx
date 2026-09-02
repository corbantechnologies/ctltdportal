import { formatCurrency, formatNumber } from "@/tools/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
interface TrialBalanceData {
    trial_balance: {
        code: string;
        name: string;
        account_type: string;
        report_role: string;
        debit: number;
        credit: number;
        balance: number;
    }[];
    totals: {
        total_debit: number;
        total_credit: number;
        net_balance: number;
    };
    division: string;
    financial_year: string;
    currency: string;
}

export function TrialBalanceReport({ data }: { data: TrialBalanceData }) {
    return (
        <Card className="h-full overflow-hidden flex flex-col rounded">
            <CardHeader>
                <CardTitle>Trial Balance</CardTitle>
                <CardDescription>{data.division} • {data.financial_year}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 -mx-4 px-4 sm:mx-0 sm:px-6">
                <div>
                    <div className="hidden md:grid grid-cols-12 gap-2 border-b border-border pb-2 mb-2 text-xs font-semibold">
                        <div className="col-span-6">Account Name</div>
                        <div className="col-span-2 text-right text-green-500">Debit</div>
                        <div className="col-span-2 text-right text-red-500">Credit</div>
                        <div className="col-span-2 text-right">Balance</div>
                    </div>

                    <div className="space-y-4 md:space-y-1">
                        {data.trial_balance.map((row) => (
                            <div key={row.code} className="grid grid-cols-12 gap-2 py-2 text-sm border-b border-border/40 hover:bg-corporate-secondary/50 transition-colors">
                                <div className="col-span-12 md:col-span-6 flex items-center tracking-tight text-black" title={row.name}>
                                    <span className="truncate mr-1 max-w-[200px] sm:max-w-none">{row.name}</span>
                                    <span className="text-[10px] hidden md:inline-block">- {row.code}</span>
                                    <span className="text-[10px] md:hidden ml-1 opacity-50">({row.code})</span>
                                </div>

                                <div className="col-span-12 md:col-span-6 flex flex-col gap-1 md:contents mt-2 md:mt-0">
                                    <div className="flex justify-between items-center md:block md:col-span-2 text-right font-mono text-corporate-muted">
                                        <span className="text-xs md:hidden text-green-500">Debit</span>
                                        <span className="text-xs md:text-sm">{row.debit > 0 ? formatNumber(row.debit) : "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center md:block md:col-span-2 text-right font-mono text-corporate-muted">
                                        <span className="text-xs md:hidden text-red-500">Credit</span>
                                        <span className="text-xs md:text-sm">{row.credit > 0 ? formatNumber(row.credit) : "-"}</span>
                                    </div>
                                    <div className={`flex justify-between items-center md:block md:col-span-2 text-right font-mono font-medium ${row.balance < 0 ? "text-red-500" : ""}`}>
                                        <span className="text-xs md:hidden">Balance</span>
                                        <span className="text-xs md:text-sm">{formatNumber(row.balance)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr className="my-4 border-black/10" />

                    <div className="grid grid-cols-12 gap-2 mt-2 -mx-2 px-6 rounded bg-corporate-primary/5 text-[11px] py-4 border border-corporate-primary/10 shadow-inner">
                        <div className="col-span-12 md:col-span-6 mb-2 md:mb-0 flex items-center text-corporate-primary italic">TOTAL DISCLOSURE</div>
                        <div className="col-span-12 md:col-span-6 flex flex-col gap-1 md:contents mt-2 md:mt-0">
                            <div className="flex justify-between items-center md:block md:col-span-2 text-right font-mono">
                                <span className="text-[10px] text-corporate-muted md:hidden font-bold">Debit</span>
                                <span>{formatNumber(data.totals.total_debit)}</span>
                            </div>
                            <div className="flex justify-between items-center md:block md:col-span-2 text-right font-mono">
                                <span className="text-[10px] text-corporate-muted md:hidden font-bold">Credit</span>
                                <span>{formatNumber(data.totals.total_credit)}</span>
                            </div>
                            <div className="flex justify-between items-center md:block md:col-span-2 text-right font-mono text-corporate-primary">
                                <span className="text-[10px] text-corporate-muted md:hidden font-bold">Balance</span>
                                <span>{formatNumber(data.totals.net_balance)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
