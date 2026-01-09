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

    // 로그인 API 응답 확인 (디버깅용)
    if (path.includes("/auth/login")) {
      // ⚠️ 중요: Set-Cookie 헤더는 브라우저 보안 정책으로 인해 JavaScript에서 읽을 수 없습니다.
      // response.headers.get("set-cookie")는 항상 null을 반환합니다. 이는 정상입니다.
      // 쿠키는 백엔드에서 Set-Cookie 헤더로 설정되며, 브라우저가 자동으로 저장합니다.
      // httpOnly 쿠키는 document.cookie에서도 보이지 않지만, 브라우저는 자동으로 포함합니다.
      
      console.log("[API] apiFetch - 로그인 응답:", {
        status: response.status,
        statusText: response.statusText,
        note: "Set-Cookie 헤더는 브라우저 보안 정책으로 JavaScript에서 읽을 수 없습니다 (정상 동작)",
      });
      
      // ✅ 성공 응답이면 쿠키는 백엔드에서 설정되었을 것입니다
      if (response.ok) {
        console.log("[API] ✅ 로그인 성공 (201) - 쿠키는 백엔드에서 설정되었습니다");
        console.log("[API] 참고: httpOnly 쿠키는 document.cookie에서 보이지 않지만, 브라우저는 자동으로 저장하고 포함합니다");
      }
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
