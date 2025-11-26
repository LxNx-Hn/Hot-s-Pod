import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

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
    tokenRefreshed ? resolve() : reject(error);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 네트워크 에러거나 응답 없음
    if (!error.response) throw error;

    // 401이 아니면 그대로 전달
    if (error.response.status !== 401 || original.__retry) {
      throw error;
    }

    // 중복 refresh 방지 큐
    if (isRefreshing) {
      await new Promise((resolve, reject) => pendingQueue.push({ resolve, reject }));
      original.__retry = true;
      return api(original); // refresh 끝난 뒤 재시도
    }

    isRefreshing = true;
    original.__retry = true;

    try {
      // refresh 쿠키로 access 쿠키 재발급
      await api.post("/oauth/refresh");
      runQueue(null, true);
      return api(original); // 원 요청 재시도
    } catch (e) {
      runQueue(e, false);
      // 여기서 로그아웃 처리 원하면 추가
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);
