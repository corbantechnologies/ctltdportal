"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export type RemunerationType = "FULL_TIME" | "COMMISSION" | "CASUAL_WAGES" | "CONTRACTOR" | "CUSTOM";

export interface PayrollItem {
    id: string;
    reference: string;
    payroll_run: string;
    employee: string | null;
    employee_name: string;
    employee_email: string | null;
    employee_kra_pin: string | null;
    job_title: string | null;
    department: string | null;
    remuneration_type: RemunerationType;
    apply_nssf: boolean;
    apply_paye: boolean;
    apply_shif: boolean;
    apply_housing_levy: boolean;
    basic_salary: number;
    allowances?: number;
    housing_allowance?: number;
    transport_allowance?: number;
    other_allowances?: number;
    gross_salary?: number;
    gross_pay?: number;
    nssf_deduction: number;
    taxable_pay: number;
    paye_tax?: number;
    paye_deduction?: number;
    shif_deduction: number;
    housing_levy?: number;
    housing_levy_deduction?: number;
    other_deductions?: number;
    total_deductions: number;
    net_salary?: number;
    net_pay?: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreatePayrollItemPayload {
    payroll_run: string;
    employee?: string;
    employee_name?: string;
    employee_email?: string;
    employee_kra_pin?: string;
    job_title?: string;
    department?: string;
    remuneration_type?: RemunerationType;
    apply_nssf?: boolean;
    apply_paye?: boolean;
    apply_shif?: boolean;
    apply_housing_levy?: boolean;
    basic_salary: number;
    allowances?: number;
    housing_allowance?: number;
    transport_allowance?: number;
    other_allowances?: number;
    nssf_deduction?: number;
    paye_tax?: number;
    shif_deduction?: number;
    housing_levy?: number;
    other_deductions?: number;
    notes?: string;
}

export interface StatutoryCalculationOptions {
    remunerationType?: RemunerationType;
    applyNssf?: boolean;
    applyPaye?: boolean;
    applyShif?: boolean;
    applyHousingLevy?: boolean;
    otherDeductions?: number;
}

export const calculateStatutoryDeductions = (
    basicSalary: number,
    allowances: number = 0,
    options: StatutoryCalculationOptions = {}
) => {
    const {
        remunerationType = "FULL_TIME",
        applyNssf = remunerationType === "FULL_TIME",
        applyPaye = remunerationType === "FULL_TIME" || remunerationType === "CONTRACTOR",
        applyShif = remunerationType === "FULL_TIME",
        applyHousingLevy = remunerationType === "FULL_TIME",
        otherDeductions = 0,
    } = options;

    const gross = (Number(basicSalary) || 0) + (Number(allowances) || 0);

    // CASUAL WAGES: 0 statutory deductions. 100% net pay.
    if (remunerationType === "CASUAL_WAGES") {
        return {
            gross: Math.round(gross * 100) / 100,
            taxable: Math.round(gross * 100) / 100,
            nssf: 0,
            paye: 0,
            shif: 0,
            housingLevy: 0,
            otherDeductions: Math.round((Number(otherDeductions) || 0) * 100) / 100,
            totalDeductions: Math.round((Number(otherDeductions) || 0) * 100) / 100,
            net: Math.round((gross - (Number(otherDeductions) || 0)) * 100) / 100,
        };
    }

    // NSSF (Tier 1: 6% up to 7,000 max 420; Tier 2: 6% between 7,000 and 36,000 max 1,740)
    let totalNssf = 0;
    if (applyNssf && remunerationType !== "COMMISSION" && remunerationType !== "CONTRACTOR") {
        let nssfTier1 = Math.min(gross, 7000) * 0.06;
        let nssfTier2 = 0;
        if (gross > 7000) {
            nssfTier2 = (Math.min(gross, 36000) - 7000) * 0.06;
        }
        totalNssf = Math.min(nssfTier1 + nssfTier2, 2160);
    }

    const taxablePay = Math.max(0, gross - totalNssf);

    // PAYE Graduated Brackets or Contractor Withholding Tax (5%)
    let finalPaye = 0;
    if (applyPaye) {
        if (remunerationType === "CONTRACTOR") {
            finalPaye = gross * 0.05; // 5% Professional WHT
        } else {
            let paye = 0;
            let rem = taxablePay;
            if (rem > 0) {
                const b1 = Math.min(rem, 24000);
                paye += b1 * 0.10;
                rem -= b1;
            }
            if (rem > 0) {
                const b2 = Math.min(rem, 8333);
                paye += b2 * 0.25;
                rem -= b2;
            }
            if (rem > 0) {
                const b3 = Math.min(rem, 467667);
                paye += b3 * 0.30;
                rem -= b3;
            }
            if (rem > 0) {
                const b4 = Math.min(rem, 300000);
                paye += b4 * 0.325;
                rem -= b4;
            }
            if (rem > 0) {
                paye += rem * 0.35;
            }
            finalPaye = Math.max(0, paye - 2400); // KES 2,400 Personal Relief
        }
    }

    // SHIF (2.75% of Gross, min 300)
    let shif = 0;
    if (applyShif && remunerationType !== "COMMISSION" && remunerationType !== "CONTRACTOR") {
        shif = Math.max(300, gross * 0.0275);
    }

    // Housing Levy (1.5% of Gross)
    let housingLevy = 0;
    if (applyHousingLevy && remunerationType !== "COMMISSION" && remunerationType !== "CONTRACTOR") {
        housingLevy = gross * 0.015;
    }

    const totalDeductions = totalNssf + finalPaye + shif + housingLevy + (Number(otherDeductions) || 0);
    const netPay = gross - totalDeductions;

    return {
        gross: Math.round(gross * 100) / 100,
        taxable: Math.round(taxablePay * 100) / 100,
        nssf: Math.round(totalNssf * 100) / 100,
        paye: Math.round(finalPaye * 100) / 100,
        shif: Math.round(shif * 100) / 100,
        housingLevy: Math.round(housingLevy * 100) / 100,
        otherDeductions: Math.round((Number(otherDeductions) || 0) * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        net: Math.round(netPay * 100) / 100,
    };
};

export const fetchPayrollItems = async (
    headers: { headers: { Authorization: string } },
    params: { payroll_run?: string; employee?: string } = {}
): Promise<PaginatedResponse<PayrollItem>> => {
    const query = new URLSearchParams();
    if (params.payroll_run) query.append("payroll_run", params.payroll_run);
    if (params.employee) query.append("employee", params.employee);

    const response: AxiosResponse<PaginatedResponse<PayrollItem>> = await apiActions.get(
        `/api/v1/payrollitems/${query.toString() ? `?${query.toString()}` : ""}`,
        headers
    );
    return response.data;
};

export const fetchPayrollItemByReference = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<PayrollItem> => {
    const response: AxiosResponse<PayrollItem> = await apiActions.get(
        `/api/v1/payrollitems/${reference}/`,
        headers
    );
    return response.data;
};

export const createPayrollItem = async (
    data: CreatePayrollItemPayload,
    headers: { headers: { Authorization: string } }
): Promise<PayrollItem> => {
    const response: AxiosResponse<PayrollItem> = await apiActions.post(
        `/api/v1/payrollitems/`,
        data,
        headers
    );
    return response.data;
};

export const deletePayrollItem = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<void> => {
    await apiActions.delete(`/api/v1/payrollitems/${reference}/`, headers);
};
