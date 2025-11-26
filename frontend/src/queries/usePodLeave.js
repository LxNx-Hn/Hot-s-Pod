import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export async function leavePod(payload) {
    const { user_id, pod_id } = payload;
    const { data } = await api.delete(`/pod-members/${pod_id}/${user_id}`);
    return data;
}

export function useLeavePod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leavePod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pods"] });
      qc.invalidateQueries({ queryKey: ["mypods"] }); // Joined Pods 새로고침
    },
  });
}