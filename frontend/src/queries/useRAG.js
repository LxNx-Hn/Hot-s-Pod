import { useMutation } from "@tanstack/react-query";
import { api } from "../api/api";

//유저가 참여한 팟 조회
export async function fetchRAG(data) {
  const res = await api.post(`/rag/search`, data);
  return res.data;
}