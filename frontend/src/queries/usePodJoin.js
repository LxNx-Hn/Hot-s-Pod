import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export async function joinPod(payload) {
  const { data } = await api.post("/pod-members/join", payload);
  return data;
}

export function useJoinPod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: joinPod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pods"] });
      qc.invalidateQueries({ queryKey: ["mypods"] }); // Joined Pods 새로고침
    },
  });
}
