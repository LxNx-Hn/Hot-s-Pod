import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

const getPods = async ({ limit = 20, offset = 0 }) => {
  const res = await api.get("/pods", { params: { limit, offset } });
  return res.data;
};

const searchPods = async ({ query, limit = 20, offset = 0 }) => {
  try{
    if(query===undefined||query==="")
      return;
    const res = await api.get("/pods/search", { params: { query, limit, offset } });
    return res.data;
  }
  catch(e)
  {
    return;
  }
};
export function usePods({ limit, offset }) {
  return useQuery({
    queryKey: ["pods", { limit, offset }],
    queryFn: () => getPods({ limit, offset }),
    staleTime: 10_000,
  });
}
export function usePodSearch({
  query,
  limit = 100,
  offset = 0,
}) {
  const enabled = typeof query === "string" && query.trim().length > 0;
  return useQuery({
    queryKey: ["pods", query, limit, offset],
    queryFn: () => searchPods({ query, limit, offset }),
    staleTime: 10_000,
    enabled,
  });
}