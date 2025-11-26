import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

async function fetchMe({ signal }) {
  // 안전장치: 요청이 오래 걸리면 타임아웃 처리하여 무한 로딩을 방지
  const timeoutMs = 8000;
  const timeoutPromise = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error("fetchMe timeout"));
    }, timeoutMs);
  });

  const reqPromise = api.get("/users/me", { signal }).then((res) => res.data);

  return Promise.race([reqPromise, timeoutPromise]);
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
    onError: (error) => {
      // 인증 실패시 로그인 페이지로 이동
      navigate("/login");
    }
  });
}
