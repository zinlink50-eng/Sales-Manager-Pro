import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Branding {
  shopName: string;
  shopTagline: string;
  logoUrl: string;
}

interface BrandingContextType {
  branding: Branding;
  isLoading: boolean;
  updateBranding: (data: Partial<Branding>) => Promise<void>;
}

const defaultBranding: Branding = {
  shopName: "Sales Manager Pro",
  shopTagline: "Pro Edition",
  logoUrl: "",
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  isLoading: true,
  updateBranding: async () => {},
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Branding>({
    queryKey: ["branding"],
    queryFn: () => api.get<Branding>("/api/branding"),
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (update: Partial<Branding>) =>
      api.put<Branding>("/api/branding", update),
    onSuccess: (updated) => {
      qc.setQueryData(["branding"], updated);
    },
  });

  const updateBranding = async (update: Partial<Branding>) => {
    await mutation.mutateAsync(update);
  };

  return (
    <BrandingContext.Provider
      value={{
        branding: data ?? defaultBranding,
        isLoading,
        updateBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
