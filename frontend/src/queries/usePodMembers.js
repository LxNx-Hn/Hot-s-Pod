import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

async function fetchPods({ user_id, signal }) {
  const res = await api.get(`/pod-members/user/${user_id}`, { signal });
  return res.data;
}

export function usePod(user_id) {
  return useQuery({
    queryKey: ["mypods", user_id],
    queryFn: ({ signal }) => fetchPods({ user_id, signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!user_id,
  });
}