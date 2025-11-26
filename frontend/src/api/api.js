import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 쿠키 자동 포함
  // headers: { "X-Requested-With": "XMLHttpRequest" }, // CSRF 방어에 쓰면 추가
});

// ----- 401 → refresh → 재시도 인터셉터 -----
let isRefreshing = false;
let pendingQueue = [];

function runQueue(error, tokenRefreshed) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (tokenRefreshed) resolve();
    else reject(error);
  });
  pendingQueue = [];
}

// 로그인 페이지로 보내는 헬퍼
function redirectToLogin() {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  // 이미 로그인 페이지에 있거나 OAuth 콜백 중이면 리다이렉트하지 않음
  if (currentPath === "/login" || currentPath === "/oauth/callback") return;
  // SPA 라우터 사용
  window.location.replace("/login");
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 네트워크 에러거나 응답 없음
    if (!error.response) {
      throw error;
    }

    // refresh 엔드포인트 자체가 401이면 재시도하지 않음
    if (original.url?.includes('/oauth/refresh')) {
      console.log('[API] Refresh token expired or invalid');
      redirectToLogin();
      throw error;
    }

    // 401이 아니거나, 이미 한 번 재시도한 요청이면 그대로 에러 전달
    if (error.response.status !== 401 || original.__retry) {
      throw error;
    }

    // 이미 다른 곳에서 refresh 중이면 → 큐에 대기
    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        });
        original.__retry = true;
        return api(original); // refresh 끝난 뒤 재시도
      } catch (e) {
        throw e;
      }
    }

    isRefreshing = true;
    original.__retry = true;

    try {
      // refresh 쿠키로 access 쿠키 재발급 시도
      await api.post("/oauth/refresh");

      // refresh 성공 → 큐에 있던 대기 요청들 깨우기
      runQueue(null, true);

      // 원래 요청 다시 시도
      return api(original);
    } catch (e) {
      // refresh 실패 → 큐에 있던 요청들 전부 실패 처리
      runQueue(e, false);

      // refresh 실패 → 로그인 페이지로 이동
      console.log('[API] Refresh failed, redirecting to login');
      redirectToLogin();

      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);