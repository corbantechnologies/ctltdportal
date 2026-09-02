"use client"

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { Quotation } from "./quotations";

// Lead status
// STATUS_CHOICES = (
//     ("NEW", "NEW"),
//     ("CONTACTED", "CONTACTED"),
//     ("QUALIFIED", "QUALIFIED"),
//     ("PROPOSAL_SENT", "PROPOSAL_SENT"),
//     ("WON", "WON"),
//     ("LOST", "LOST"),
//     )

export interface Lead {
    id: string;
    reference: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    company_name: string;
    tax_pin: string;
    status: string;
    division: string;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
    partner_reference?: string;
    quotations?: Quotation[]
}

interface createLead {
    first_name: string;
    last_name: string;
    email: string; // optional
    phone: string; // optional
    country: string; // optional
    company_name: string; // optional
    tax_pin: string; // optional
    division: string; // division name
    status: string; // optional
}

interface updateLead {
    first_name: string;
    last_name: string;
    email: string; // optional
    phone: string; // optional
    country: string; // optional
    company_name: string; // optional
    tax_pin: string; // optional
    division: string; // division name
    status: string; // optional

}

export const createLead = async (
    data: createLead,
    headers: { headers: { Authorization: string } }
): Promise<Lead> => {
    const response: AxiosResponse<Lead> = await apiActions.post(
        `/api/v1/leads/`,
        data,
        headers
    );
    return response.data;
};

export const updateLead = async (
    reference: string,
    data: updateLead,
    headers: { headers: { Authorization: string } }
): Promise<Lead> => {
    const response: AxiosResponse<Lead> = await apiActions.patch(
        `/api/v1/leads/${reference}/`,
        data,
        headers
    );
    return response.data;
};

export const deleteLead = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<Lead> => {
    const response: AxiosResponse<Lead> = await apiActions.delete(
        `/api/v1/leads/${reference}/`,
        headers
    );
    return response.data;
};

// All can read
export const getLeads = async (headers: {
    headers: { Authorization: string };
}): Promise<Lead[]> => {
    const response: AxiosResponse<PaginatedResponse<Lead>> =
        await apiActions.get(`/api/v1/leads/`, headers);
    return response.data.results || [];
};

export const getLead = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<Lead> => {
    const response: AxiosResponse<Lead> = await apiActions.get(
        `/api/v1/leads/${reference}/`,
        headers
    );
    return response.data;
};

export const convertLeadToPartner = async (
    reference: string,
    partner_type: string,
    headers: { headers: { Authorization: string } }
): Promise<{ message: string; partner_reference: string; partner_name: string }> => {
    const response: AxiosResponse<{ message: string; partner_reference: string; partner_name: string }> = await apiActions.patch(
        `/api/v1/leads/${reference}/convert/`,
        { partner_type },
        headers
    );
    return response.data;
};