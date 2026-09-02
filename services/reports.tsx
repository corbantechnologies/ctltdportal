"use client"

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";

export interface PnL {
    revenue: number;
    cost_of_sales: number;
    gross_profit: number;
    operating_expenses: number;
    operating_profit: number;
    other_income: number;
    non_operating_expense: number;
    net_profit: number;
    division: string;
    currency: string;
    start_date: string | null;
    end_date: string | null;
}

export interface BalanceSheet {
    assets: {
        current: {
            debit: number;
            credit: number;
            net: number;
        };
        non_current: {
            debit: number;
            credit: number;
            net: number;
        };
        total: number;
    };
    liabilities: {
        current: {
            debit: number;
            credit: number;
            net: number;
        };
        non_current: {
            debit: number;
            credit: number;
            net: number;
        };
        total: number;
    };
    equity: {
        debit: number;
        credit: number;
        net: number;
    };
    other: {
        debit: number;
        credit: number;
        net: number;
    };
    total_assets: number;
    total_liabilities_and_equity: number;
    balance_check: number;
    division: string;
    as_of_date: string;
    currency: string;
}

export interface TrialBalance {
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

export interface Revenue {
    group_total_revenue: number;
    breakdown: {
        division: string;
        revenue: number;
    }[];
    financial_year: string;
    currency: string;
    warning: string | null;
}

export interface CashBalance {
    cash_balance: number;
    cash_only: number;
    bank_balance: number;
    currency: string;
    division: string;
    as_of_date: string;
    warning?: string;
}

export const getPNL = async (
    headers: { headers: { Authorization: string } },
    params: Record<string, string> = {}
): Promise<PnL> => {
    const q = new URLSearchParams(params).toString();
    const response: AxiosResponse<PnL> = await apiActions.get(`/api/v1/reports/pnl/${q ? `?${q}` : ""}`, headers);
    return response.data;
}

export const getBalanceSheet = async (
    headers: { headers: { Authorization: string } },
    params: Record<string, string> = {}
): Promise<BalanceSheet> => {
    const q = new URLSearchParams(params).toString();
    const response: AxiosResponse<BalanceSheet> = await apiActions.get(`/api/v1/reports/balance-sheet/${q ? `?${q}` : ""}`, headers);
    return response.data;
}

export const getTrialBalance = async (
    headers: { headers: { Authorization: string } },
    params: Record<string, string> = {}
): Promise<TrialBalance> => {
    const q = new URLSearchParams(params).toString();
    const response: AxiosResponse<TrialBalance> = await apiActions.get(`/api/v1/reports/trial-balance/${q ? `?${q}` : ""}`, headers);
    return response.data;
}

export const getRevenue = async (
    headers: { headers: { Authorization: string } },
    params: Record<string, string> = {}
): Promise<Revenue> => {
    const q = new URLSearchParams(params).toString();
    const response: AxiosResponse<Revenue> = await apiActions.get(`/api/v1/reports/revenue/${q ? `?${q}` : ""}`, headers);
    return response.data;
}

export const getCashBalance = async (
    headers: { headers: { Authorization: string } },
    params: Record<string, string> = {}
): Promise<CashBalance> => {
    const q = new URLSearchParams(params).toString();
    const response: AxiosResponse<CashBalance> = await apiActions.get(`/api/v1/reports/cash-balance/${q ? `?${q}` : ""}`, headers);
    return response.data;
}

export interface GLStatementEntry {
    id: number;
    date: string;
    journal_code: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    partner: string | null;
}

export interface GLStatement {
    book_code: string;
    book_name: string;
    opening_balance: number;
    closing_balance: number;
    entries: GLStatementEntry[];
    start_date: string | null;
    end_date: string | null;
    currency: string;
    error?: string;
}

export const getGLStatement = async (
    bookReference: string,
    params: { start_date?: string; end_date?: string; division?: string } = {},
    headers: { headers: { Authorization: string } }
): Promise<GLStatement> => {
    const query = new URLSearchParams();
    query.append("book_reference", bookReference);
    if (params.start_date) query.append("start_date", params.start_date);
    if (params.end_date) query.append("end_date", params.end_date);
    if (params.division) query.append("division", params.division);

    const response: AxiosResponse<GLStatement> = await apiActions.get(`/api/v1/reports/gl-statement/?${query.toString()}`, headers);
    return response.data;
}