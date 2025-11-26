import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

export async function getChats({ pod_id, signal }) {
  const { data } = await api.get(`/chat/pod/${pod_id}`, { signal });
  return data;
}

export function useMessage(pod_id) {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["pod_id", pod_id],
    queryFn: ({ signal }) => getChats({ pod_id, signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false, // 401 재시도는 인터셉터가 담당
    enabled: !!pod_id,
    onSuccess: (data) => {
      alert(`[useChat] /chat/pod/ =>`, data);
    },
    onError: (error) => {
      navigate("/login");
    }
  });
}