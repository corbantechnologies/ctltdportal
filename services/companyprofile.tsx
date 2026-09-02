"use client"

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";


export interface CompanyProfile {
    id: string;
    reference: string;
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    tax_pin: string;
    logo_url: string;
    header_url: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const getCompanyProfile = async (): Promise<CompanyProfile> => {
    const response: AxiosResponse<CompanyProfile> = await apiActions.get(
        `/api/v1/companyprofile/`
    );
    return response.data;
};

export const getActiveCompanyProfile = async (): Promise<CompanyProfile> => {
    const response: AxiosResponse<CompanyProfile> = await apiActions.get(
        `/api/v1/companyprofile/active/`
    );
    return response.data;
};