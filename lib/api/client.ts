export type RequestConfig = RequestInit & {
  accessToken?: string | null;
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
  const { accessToken, onUnauthorized, headers, ...fetchConfig } = config;

  const isFormData = fetchConfig.body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // FormData를 사용할 때는 브라우저가 적절한 Content-Type을 설정하므로 명시적으로 설정하지 않습니다.
  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(
      path.startsWith("http") ? path : `${BASE_URL}${path}`,
      {
        ...fetchConfig,
        headers: requestHeaders,
      }
    );

    if (response.status === 401 && onUnauthorized) {
      await onUnauthorized();
    }

    let data: T;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) data = await response.json();
    else data = (await response.text()) as unknown as T;

    if (!response.ok) {
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
