import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@redux/slices/userSlice";
import { useQueryClient } from "@tanstack/react-query";
import {api} from "../../src/api/api";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        dispatch(setUser({ userName: data.username || data.nickname || "사용자" }));
        qc.invalidateQueries({ queryKey: ["me"] });
        navigate("/", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate, dispatch, qc]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-50 to-teal-50">
        <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-2xl font-bold mb-4 text-gray-800">로그인 처리 중</div>
            <div className="text-gray-600">잠시만 기다려주세요...</div>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
        </div>
        </div>
    </div>
  );
}
