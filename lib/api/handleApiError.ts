import { ApiClientError } from "./client";

type ErrorType = "auth" | "network" | "server" | "input";
type UiType = "toast" | "inline" | "alert";

type ErrorHandlingResult = {
  errorType: ErrorType;
  userMessage: string;
  uiType: UiType;
  canRetry: boolean;
  retryAction?: () => void | Promise<void>;
};

/**
 * ApiClientError를 기반으로 에러를 분류하고 처리 정보를 반환합니다.
 * 
 * @param error - ApiClientError 인스턴스
 * @param retryAction - 재시도 함수 (옵션)
 * @returns ErrorHandlingResult
 */
export function handleApiError(
  error: ApiClientError,
  retryAction?: () => void | Promise<void>
): ErrorHandlingResult {
  const { status, message, data } = error;

  // 401: 인증 에러
  if (status === 401) {
    return {
      errorType: "auth",
      userMessage: "세션이 만료되었습니다. 다시 로그인해주세요.",
      uiType: "toast",
      canRetry: false,
    };
  }

  // 0: 네트워크 에러
  if (status === 0) {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;
    return {
      errorType: "network",
      userMessage: isOnline
        ? "네트워크 연결을 확인해주세요."
        : "인터넷 연결이 없습니다. 네트워크를 확인해주세요.",
      uiType: "toast",
      canRetry: true,
      retryAction,
    };
  }

  // 500 이상: 서버 에러
  if (status >= 500) {
    let userMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    
    if (status === 502) {
      userMessage = "서비스를 일시적으로 사용할 수 없습니다.";
    } else if (status === 503) {
      userMessage = "서비스가 일시적으로 중단되었습니다. 잠시 후 다시 시도해주세요.";
    } else if (status === 504) {
      userMessage = "요청 시간이 초과되었습니다. 다시 시도해주세요.";
    }

    return {
      errorType: "server",
      userMessage,
      uiType: "toast",
      canRetry: true,
      retryAction,
    };
  }

  // 400-499: 사용자 입력 에러 (401 제외)
  if (status >= 400 && status < 500) {
    // 서버에서 제공한 상세 메시지 확인
    let userMessage = "요청을 처리할 수 없습니다.";
    
    if (data && typeof data === "object") {
      const errorData = data as Record<string, unknown>;
      
      // 필드별 에러 메시지가 있는 경우
      if (errorData.fieldErrors && typeof errorData.fieldErrors === "object") {
        // 필드별 에러는 호출하는 컴포넌트에서 처리
        userMessage = "입력한 내용에 오류가 있습니다.";
      } 
      // 일반 에러 메시지
      else if (errorData.message && typeof errorData.message === "string") {
        userMessage = errorData.message;
      }
    }

    // 상태 코드별 기본 메시지
    if (status === 400) {
      userMessage = "잘못된 요청입니다. 입력 내용을 확인해주세요.";
    } else if (status === 403) {
      userMessage = "권한이 없습니다.";
    } else if (status === 404) {
      userMessage = "요청한 리소스를 찾을 수 없습니다.";
    } else if (status === 422) {
      userMessage = "입력한 내용에 오류가 있습니다.";
    }

    return {
      errorType: "input",
      userMessage,
      uiType: "inline",
      canRetry: false,
    };
  }

  // 알 수 없는 에러
  return {
    errorType: "server",
    userMessage: message || "알 수 없는 오류가 발생했습니다.",
    uiType: "toast",
    canRetry: false,
  };
}

export const BASE_URL = "https://leaf-post-back.onrender.com/api";
export type { ErrorHandlingResult, ErrorType, UiType };

