export type RequestConfig = RequestInit & {
  onUnauthorized?: () => void | Promise<void>;
};

export type ApiResponse<T = unknown> = {
  data: T;
  status: number;
  statusText: string;
};

export type ApiError = {
  message: string;
  status: number;
  statusText: string;
  data?: unknown;
};

export class ApiClientError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// ----------------------
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";


export async function apiFetch<T = unknown>(
  path: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { onUnauthorized, headers, ...fetchConfig } = config;

  const isFormData = fetchConfig.body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // FormData를 사용할 때는 브라우저가 적절한 Content-Type을 설정하므로 명시적으로 설정하지 않습니다.
  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  try {
    const fullUrl = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    
    // 모바일 환경 디버깅을 위한 로그 (로그인 API만)
    if (path.includes("/auth/login")) {
      console.log("[API] apiFetch - 로그인 요청:", {
        url: fullUrl,
        method: fetchConfig.method || "GET",
        credentials: "include",
        hasBody: !!fetchConfig.body,
        headers: requestHeaders,
      });
    }
    
    const response = await fetch(
      fullUrl,
      {
        ...fetchConfig,
        headers: requestHeaders,
        credentials: "include", // 쿠키 기반 인증을 위해 쿠키 포함 (모바일/데스크톱 모두 필수)
      }
    );

    // 로그인 API 응답 헤더 확인 (모바일 디버깅용)
    if (path.includes("/auth/login")) {
      const setCookieHeader = response.headers.get("set-cookie");
      console.log("[API] apiFetch - 로그인 응답 헤더:", {
        status: response.status,
        statusText: response.statusText,
        setCookie: setCookieHeader || "(Set-Cookie 헤더 없음)",
        allHeaders: Object.fromEntries(response.headers.entries()),
      });
      
      // 모바일 환경 감지
      const isMobile = typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log("[API] apiFetch - 환경 정보:", {
        isMobile,
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "N/A",
        origin: typeof window !== "undefined" ? window.location.origin : "N/A",
      });
    }

    if (response.status === 401 && onUnauthorized) {
      await onUnauthorized();
    }

    let data: T;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) data = await response.json();
    else data = (await response.text()) as unknown as T;

    if (!response.ok) {
      // 에러 응답 상세 로깅
      console.error(`[API] ${response.status} ${response.statusText} - ${path}`, {
        status: response.status,
        statusText: response.statusText,
        data: data,
        requestBody: config.body ? (typeof config.body === 'string' ? config.body : JSON.stringify(config.body)) : undefined,
      });
      
      throw new ApiClientError(
        `API request failed: ${response.statusText}`,
        response.status,
        response.statusText,
        data
      );
    }

    return { data, status: response.status, statusText: response.statusText };
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    if (err instanceof Error) throw new ApiClientError(err.message, 0, "Network Error");
    throw new ApiClientError("Unknown error", 0, "Unknown Error");
  }
}

// 편의 메서드
export const api = {
  get: <T = unknown>(url: string, config?: RequestConfig) => apiFetch<T>(url, { ...config, method: "GET" }),
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => apiFetch<T>(url, { ...config, method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => apiFetch<T>(url, { ...config, method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => apiFetch<T>(url, { ...config, method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: <T = unknown>(url: string, config?: RequestConfig) => apiFetch<T>(url, { ...config, method: "DELETE" }),
};
