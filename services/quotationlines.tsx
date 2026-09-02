"use client"


import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface QuotationLine {
    id: string;
    reference: string;
    quotation: string;
    product: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
}

export interface QuotationLineData {
    quotation: string;
    product: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export const createQuotationLine = async (
    data: QuotationLineData,
    headers: { headers: { Authorization: string } }
): Promise<QuotationLine> => {
    const response: AxiosResponse<QuotationLine> = await apiActions.post(
        `/api/v1/quotationlines/`,
        data,
        headers
    );
    return response.data;
};

export const getQuotationLines = async (
    headers: { headers: { Authorization: string } }
): Promise<QuotationLine[]> => {
    const response: AxiosResponse<PaginatedResponse<QuotationLine>> = await apiActions.get(
        `/api/v1/quotationlines/`,
        headers
    );
    return response.data.results;
};

export const getQuotationLine = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<QuotationLine> => {
    const response: AxiosResponse<QuotationLine> = await apiActions.get(
        `/api/v1/quotationlines/${reference}/`,
        headers
    );
    return response.data;
};

export const updateQuotationLine = async (
    reference: string,
    data: Partial<QuotationLineData>,
    headers: { headers: { Authorization: string } }
): Promise<QuotationLine> => {
    const response: AxiosResponse<QuotationLine> = await apiActions.patch(
        `/api/v1/quotationlines/${reference}/`,
        data,
        headers
    );
    return response.data;
};

export const deleteQuotationLine = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<void> => {
    await apiActions.delete(
        `/api/v1/quotationlines/${reference}/`,
        headers
    );
};
