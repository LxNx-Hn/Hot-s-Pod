import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

async function fetchMe({ signal }) {
  try{
    const res = await api.get("/users/me", { signal });
    return res.data;
  }
  catch (e)
  {
    const navigate = useNavigate();
    navigate("/login");
  }
}

export function useMe() {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false, // 401 재시도는 인터셉터가 담당
    onSuccess: (data) => {
      alert("[useMe] /users/me =>", data);
    },
    onError: (error) => {
      navigate("/login");
    }
  });
}
