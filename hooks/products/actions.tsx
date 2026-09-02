"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getProducts, getProduct } from "@/services/products";

export function useFetchProducts() {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["products"],
        queryFn: () => getProducts(header),
        enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}

export function useFetchProduct(reference: string) {
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["product", reference],
        queryFn: () => getProduct(reference, header),
        enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
    });
}
