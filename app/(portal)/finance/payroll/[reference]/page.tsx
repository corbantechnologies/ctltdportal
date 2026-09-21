"use client";

import { use } from "react";
import PayrollStudio from "@/components/payroll/PayrollStudio";

interface PageProps {
    params: Promise<{ reference: string }>;
}

export default function FinancePayrollDetailPage({ params }: PageProps) {
    const { reference } = use(params);
    return <PayrollStudio runReference={reference} rolePrefix="finance" />;
}
