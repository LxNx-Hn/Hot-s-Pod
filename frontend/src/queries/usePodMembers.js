import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

//유저가 참여한 팟 조회
async function fetchPods({ user_id, signal }) {
  const res = await api.get(`/pod-members/user/${user_id}`, { signal });
  return res.data;
}

//유저가 생성한 팟 조회
async function fetchUserPods({user_id, signal}) {
  const res = await api.get(`/pod-members/host/${user_id}`,{ signal });
  return res.data;
}

// 유저가 참여한 팟 조회 캐싱
export function usePodMe(user_id) {
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

// 유저가 생성한 팟 조회 캐싱
export function useUsersPod(user_id) {
  return useQuery({
    queryKey: ["userspods", user_id],
    queryFn: ({ signal }) => fetchUserPods({ user_id, signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!user_id,
  });
}