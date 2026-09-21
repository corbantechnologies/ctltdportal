"use client";

import { use } from "react";
import VendorBillStudio from "@/components/vendorbills/VendorBillStudio";

interface PageProps {
    params: Promise<{ reference: string }>;
}

export default function FinanceVendorBillDetailPage({ params }: PageProps) {
    const { reference } = use(params);
    return <VendorBillStudio billReference={reference} rolePrefix="finance" />;
}
