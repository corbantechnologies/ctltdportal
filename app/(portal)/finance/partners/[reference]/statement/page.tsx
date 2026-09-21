"use client";

import { use } from "react";
import { CustomerStatementStudio } from "@/components/partners/CustomerStatementStudio";

interface PageProps {
    params: Promise<{ reference: string }>;
}

export default function FinanceCustomerStatementPage({ params }: PageProps) {
    const { reference } = use(params);
    return <CustomerStatementStudio partnerReference={reference} rolePrefix="finance" />;
}
