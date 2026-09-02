"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveCompanyProfile } from "@/services/companyprofile";

export function useFetchActiveCompanyProfile() {

    return useQuery({
        queryKey: ["activecompanyprofile"],
        queryFn: () => getActiveCompanyProfile(),
    });
}

