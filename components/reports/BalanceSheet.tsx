import { formatCurrency, formatNumber } from "@/tools/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { BalanceSheet } from "@/services/reports";

interface SectionData {
    debit: number;
    credit: number;
    net: number;
}

export function BalanceSheetReport({ data }: { data: BalanceSheet }) {
    const RowSection = ({ title, section }: { title: string; section: SectionData }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-sm px-2 py-1 text-corporate-muted">
            <div className="flex justify-between md:block">
                <span className="md:hidden text-corporate-muted font-sans text-xs">{title} Debit:</span>
                {formatNumber(section.debit)}
            </div>
            <div className="flex justify-between md:block">
                <span className="md:hidden text-corporate-muted font-sans text-xs">{title} Credit:</span>
                {formatNumber(section.credit)}
            </div>
            <div className={`flex justify-between md:block md:text-right ${section.net < 0 ? "text-red-500" : ""}`}>
                <span className="md:hidden text-corporate-muted font-sans text-xs">{title} Net:</span>
                {formatNumber(section.net)}
            </div>
        </div>
    );

    const ComplexSection = ({
        title,
        current,
        non_current,
        total,
    }: {
        title: string;
        current: SectionData;
        non_current: SectionData;
        total: number;
    }) => (
        <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase text-corporate-foreground mb-2 flex items-center gap-2">
                {title}
                <div className="h-px flex-1 bg-border/50" />
            </h3>
            <div className="hidden md:grid grid-cols-3 gap-2 text-[10px] font-bold text-corporate-muted/60 mb-2 px-3">
                <div>Debit</div>
                <div>Credit</div>
                <div className="text-right">Net</div>
            </div>
            <div className="bg-corporate-secondary/40 border border-corporate-secondary/20 p-2 rounded">
                <div className="text-[10px] uppercase font-bold text-corporate-muted mb-1 px-2">Current</div>
                <RowSection title={`Current ${title}`} section={current} />
                <div className="text-[10px] uppercase font-bold text-corporate-muted mt-2 mb-1 px-2">Non-Current</div>
                <RowSection title={`Non-Current ${title}`} section={non_current} />
                <div className="flex justify-between items-center text-sm font-bold border-t border-black/10 mt-2 pt-2 px-2">
                    <span className="font-sans text-xs uppercase text-black">Total {title}</span>
                    <span className={`font-mono ${total < 0 ? "text-red-500" : "text-black"}`}>{formatNumber(total)}</span>
                </div>
            </div>
        </div>
    );

    const SimpleSection = ({ title, section }: { title: string; section: SectionData }) => (
        <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase text-corporate-foreground mb-2 flex items-center gap-2">
                {title}
                <div className="h-px flex-1 bg-border/50" />
            </h3>
            <div className="hidden md:grid grid-cols-3 gap-2 text-[10px] font-bold text-corporate-muted/60 mb-2 px-3">
                <div>Debit</div>
                <div>Credit</div>
                <div className="text-right">Net</div>
            </div>
            <div className="bg-corporate-secondary/40 border border-corporate-secondary/20 p-2 rounded">
                <RowSection title={title} section={section} />
            </div>
        </div>
    );

    // Equity section — separate permanent equity from current period P&L
    const equitySection = data.equity as SectionData & { net_income?: number };
    const permanentEquityNet = equitySection.net - (equitySection.net_income ?? 0);

    return (
        <Card className="h-full rounded">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-black text-xl">Balance Sheet</CardTitle>
                        <CardDescription className="font-bold text-xs uppercase mt-1">
                            {data.division} • As of {data.as_of_date}
                        </CardDescription>
                        <CardDescription className="text-[10px] text-corporate-primary mt-2 bg-corporate-primary/5 px-3 py-1 rounded inline-block border border-corporate-primary/10">
                            Check: {formatCurrency(data.balance_check, data.currency)}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ComplexSection
                    title="Assets"
                    current={data.assets.current}
                    non_current={data.assets.non_current}
                    total={data.assets.total}
                />
                <hr className="my-2 border-black/10" />
                <ComplexSection
                    title="Liabilities"
                    current={data.liabilities.current}
                    non_current={data.liabilities.non_current}
                    total={data.liabilities.total}
                />
                <hr className="my-2 border-black/10" />

                {/* Equity — permanent equity + current period net income shown separately */}
                <div className="mb-4">
                    <h3 className="text-xs font-semibold uppercase text-corporate-foreground mb-2 flex items-center gap-2">
                        Equity
                        <div className="h-px flex-1 bg-border/50" />
                    </h3>
                    <div className="bg-corporate-secondary/40 border border-corporate-secondary/20 p-2 rounded space-y-1">
                        <div className="flex justify-between items-center px-2 py-1 text-sm text-corporate-muted">
                            <span className="font-sans text-xs">
                                Permanent Equity (Share Capital + Retained Earnings b/f)
                            </span>
                            <span className="font-mono">{formatNumber(permanentEquityNet)}</span>
                        </div>
                        {equitySection.net_income !== undefined && (
                            <div
                                className={`flex justify-between items-center px-2 py-1 text-sm ${
                                    equitySection.net_income < 0 ? "text-red-500" : "text-emerald-700"
                                }`}
                            >
                                <span className="font-sans text-xs font-semibold">
                                    Current Period Profit / (Loss)
                                </span>
                                <span className="font-mono font-bold">
                                    {formatNumber(equitySection.net_income)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-t border-black/10 mt-1 pt-2 px-2 text-sm font-bold">
                            <span className="font-sans text-xs uppercase text-black">Total Equity</span>
                            <span className={`font-mono ${equitySection.net < 0 ? "text-red-500" : "text-black"}`}>
                                {formatNumber(equitySection.net)}
                            </span>
                        </div>
                    </div>
                </div>

                {data.other && (data.other.debit !== 0 || data.other.credit !== 0) && (
                    <>
                        <hr className="my-2 border-black/10" />
                        <SimpleSection title="Other" section={data.other} />
                    </>
                )}

                <hr className="my-2 border-black/10" />
                <div className="pt-2">
                    <div className="flex justify-between items-center mb-2 text-sm bg-corporate-primary/5 px-2 py-1 rounded">
                        <span className="font-bold uppercase text-xs">Total Assets</span>
                        <span className="font-mono font-bold text-corporate-primary">
                            {formatNumber(data.total_assets)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-1 rounded">
                        <span className="font-bold uppercase text-xs">Total Liab + Equity</span>
                        <span className="font-mono font-bold">
                            {formatNumber(data.total_liabilities_and_equity)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
