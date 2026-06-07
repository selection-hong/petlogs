/* PetLogs — REST API 클라이언트
 * - 동일 출처(8081)에서 서빙되므로 세션 쿠키(JSESSIONID)가 자동 전송됨
 * - 백엔드 공통 포맷 ApiResponse<T> = { success, data, message } 를 언랩
 */
(function () {
  const BASE = "/api";

  async function request(method, path, body) {
    const opts = {
      method,
      credentials: "same-origin",
      headers: { "Accept": "application/json" }
    };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(BASE + path, opts);
    } catch (e) {
      throw new ApiError("서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.", 0);
    }

    // 204 No Content (삭제 등) — 본문 없음
    if (res.status === 204) return null;

    let payload = null;
    const text = await res.text();
    if (text) {
      try { payload = JSON.parse(text); } catch (_) { payload = null; }
    }

    if (res.status === 401) {
      // 세션 만료/미로그인 → 로그인으로 이동
      if (!location.hash.startsWith("#/login") && !location.hash.startsWith("#/survey/")) {
        const msg = (payload && payload.message) || "로그인이 필요합니다.";
        location.hash = "#/login";
        throw new ApiError(msg, 401);
      }
      throw new ApiError((payload && payload.message) || "인증이 필요합니다.", 401);
    }

    if (!res.ok) {
      const msg = (payload && payload.message) || "요청 처리 중 오류가 발생했습니다.";
      throw new ApiError(msg, res.status, payload && payload.data);
    }

    // ApiResponse 언랩 (success/data/message). data 없으면 payload 그대로 반환.
    if (payload && typeof payload === "object" && "success" in payload) {
      return payload.data;
    }
    return payload;
  }

  class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.data = data || null;
    }
  }

  window.ApiError = ApiError;
  window.api = {
    get: (p) => request("GET", p),
    post: (p, b) => request("POST", p, b),
    patch: (p, b) => request("PATCH", p, b),
    del: (p) => request("DELETE", p),

    // 도메인 헬퍼
    auth: {
      login: (email, password) => request("POST", "/auth/login", { email, password }),
      signup: (b) => request("POST", "/auth/signup", b),
      logout: () => request("POST", "/auth/logout")
    },
    dashboard: () => request("GET", "/dashboard"),
    surveys: {
      list: () => request("GET", "/surveys"),
      get: (id) => request("GET", "/surveys/" + id),
      createLink: (b) => request("POST", "/surveys/link", b),
      submitPublic: (token, b) => request("POST", "/surveys/public/" + token, b),
      confirm: (id) => request("PATCH", "/surveys/" + id + "/confirm"),
      aiAnalysis: (id) => request("POST", "/surveys/" + id + "/ai-analysis")
    },
    cases: {
      list: () => request("GET", "/training-cases"),
      get: (id) => request("GET", "/training-cases/" + id),
      create: (b) => request("POST", "/training-cases", b),
      updateStatus: (id, status) => request("PATCH", "/training-cases/" + id + "/status", { status }),
      logs: (id) => request("GET", "/training-cases/" + id + "/logs"),
      addLog: (id, b) => request("POST", "/training-cases/" + id + "/logs", b)
    },
    logs: {
      update: (id, b) => request("PATCH", "/training-logs/" + id, b),
      remove: (id) => request("DELETE", "/training-logs/" + id)
    },
    posts: {
      list: (params) => {
        const q = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") q.set(k, v); });
        const s = q.toString();
        return request("GET", "/posts" + (s ? "?" + s : ""));
      },
      get: (id) => request("GET", "/posts/" + id),
      create: (b) => request("POST", "/posts", b),
      update: (id, b) => request("PATCH", "/posts/" + id, b),
      remove: (id) => request("DELETE", "/posts/" + id),
      toggleLike: (id) => request("POST", "/posts/" + id + "/likes"),
      toggleBookmark: (id) => request("POST", "/posts/" + id + "/bookmarks"),
      comments: (id) => request("GET", "/posts/" + id + "/comments"),
      addComment: (id, content) => request("POST", "/posts/" + id + "/comments", { content }),
      report: (id, reason) => request("POST", "/posts/" + id + "/reports", { reason })
    },
    comments: {
      remove: (id) => request("DELETE", "/comments/" + id)
    }
  };
})();
