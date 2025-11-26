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
      // URL에서 에러 파라미터 확인
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const ok = params.get('ok');
      
      // 에러가 있으면 바로 로그인 페이지로
      if (error) {
        console.log('[OAuth] 카카오 인증 에러:', error);
        navigate("/login", { replace: true });
        return;
      }
      
      // ok 파라미터가 없으면 잘못된 접근
      if (!ok) {
        console.log('[OAuth] 잘못된 콜백 접근');
        navigate("/login", { replace: true });
        return;
      }
      
      // 로그인 성공 - 사용자 정보 조회
      try {
        const { data } = await api.get("/users/me");
        dispatch(setUser({ userName: data.username || data.nickname || "사용자" }));
        qc.invalidateQueries({ queryKey: ["me"] });
        navigate("/", { replace: true });
      } catch (err) {
        console.error('[OAuth] 사용자 정보 조회 실패:', err);
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
