import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/auth";

export function useAuth() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    user: meQuery.data?.data ?? null,
    isLoading: meQuery.isPending,
    isError: meQuery.isError,
    isAuthenticated: !!meQuery.data?.data,
  };
}
