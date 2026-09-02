"use client"

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

export interface Interaction {
    id: string;
    reference: string;
    lead?: string;
    partner?: string;
    performed_by: string;
    performed_by_details: {
        first_name: string;
        last_name: string;
        email: string;
        member_code: string;
    };
    interaction_type: "CALL" | "EMAIL" | "MEETING" | "NOTE" | "PROPOSAL";
    title: string;
    notes: string;
    date: string;
    created_at: string;
}

export interface CreateInteraction {
    lead?: string;
    partner?: string;
    interaction_type: string;
    title: string;
    notes: string;
}

export const getInteractions = async (
    params: { lead?: string; partner?: string },
    headers: { headers: { Authorization: string } }
): Promise<Interaction[]> => {
    const response: AxiosResponse<PaginatedResponse<Interaction>> = await apiActions.get(
        `/api/v1/interactions/`,
        { ...headers, params }
    );
    return response.data.results || [];
};

export const createInteraction = async (
    data: CreateInteraction,
    headers: { headers: { Authorization: string } }
): Promise<Interaction> => {
    const response: AxiosResponse<Interaction> = await apiActions.post(
        `/api/v1/interactions/`,
        data,
        headers
    );
    return response.data;
};
