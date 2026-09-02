"use client"

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

// TYPE_CHOICES = (
//     ("GOODS", "GOODS"),
//     ("SERVICE", "SERVICE"),
//     )
// BILLING_CHOICES = (
//     ("ONE_TIME", "ONE_TIME"),
//     ("MONTHLY", "MONTHLY"),
//     ("YEARLY", "YEARLY"),
//     )

export interface Products {
    id: number;
    name: string;
    description: string;
    unit_price: number;
    is_active: boolean;
    product_type: string;
    billing_cycle: string;
    quantity: number;
    sku: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    reference: string;
}

export interface createProduct {
    name: string; // required and must be unique
    product_type: string; // required
    billing_cycle: string; // required
    description: string;
    unit_price: number;
    is_active: boolean;
    quantity: number; // required if the type is a GOODS
}

export interface updateProduct {
    name: string; // required and must be unique
    product_type: string; // required
    billing_cycle: string; // required
    description: string;
    unit_price: number;
    is_active: boolean;
    quantity: number; // required if the type is a GOODS
}

export const createProduct = async (
    data: createProduct,
    headers: { headers: { Authorization: string } }
): Promise<Products> => {
    const response: AxiosResponse<Products> = await apiActions.post(
        `/api/v1/products/`,
        data,
        headers
    );
    return response.data;
};

export const updateProduct = async (
    reference: string,
    data: updateProduct,
    headers: { headers: { Authorization: string } }
): Promise<Products> => {
    const response: AxiosResponse<Products> = await apiActions.patch(
        `/api/v1/products/${reference}/`,
        data,
        headers
    );
    return response.data;
};

export const deleteProduct = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<Products> => {
    const response: AxiosResponse<Products> = await apiActions.delete(
        `/api/v1/products/${reference}/`,
        headers
    );
    return response.data;
};

export const getProducts = async (headers: {
    headers: { Authorization: string };
}): Promise<Products[]> => {
    const response: AxiosResponse<PaginatedResponse<Products>> =
        await apiActions.get(`/api/v1/products/`, headers);
    return response.data.results || [];
};

export const getProduct = async (
    reference: string,
    headers: { headers: { Authorization: string } }
): Promise<Products> => {
    const response: AxiosResponse<Products> = await apiActions.get(
        `/api/v1/products/${reference}/`,
        headers
    );
    return response.data;
};