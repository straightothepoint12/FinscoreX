import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { PublicUser } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<PublicUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: user || null,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}
