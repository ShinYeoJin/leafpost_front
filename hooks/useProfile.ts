import { useState } from "react";
import { apiFetch } from "@/lib/api/client";

type UpdateNicknameRequest = {
  nickname: string;
};

type UpdateNicknameResponse = {
  nickname: string;
};

type UpdateProfileRequest = {
  profileImage?: File | string | null;
};

type UpdateProfileResponse = {
  profileImage?: string;
  profileUrl?: string;
};

type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

type UpdatePasswordResponse = {
  success: boolean;
};

type GetUserInfoResponse = {
  email: string;
  nickname: string;
  profileImage?: string;
  profileUrl?: string;
  profile_image?: string; // 백엔드 필드명 변형 지원
  imageUrl?: string; // 백엔드 필드명 변형 지원
  profileImageUrl?: string; // 백엔드 필드명 변형 지원
  [key: string]: any; // 추가 필드 지원
};

/**
 * 현재 사용자 정보 가져오기
 * 백엔드 라우트: GET /api/users/me
 * 
 * 백엔드 응답 구조:
 * - 직접 응답: { email, nickname, profileImage, ... }
 * - 인터셉터 래핑: { data: { email, nickname, profileImage, ... } }
 */
export async function getUserInfo(): Promise<GetUserInfoResponse> {
  try {
    const response = await apiFetch<any>("/users/me", {
      method: "GET",
    });
    
    console.log("[Profile] getUserInfo - ✅ 사용자 정보 조회 성공:", {
      status: response.status,
      rawData: response.data,
      dataType: typeof response.data,
      hasDataProperty: response.data && typeof response.data === 'object' && 'data' in response.data,
    });
    
    // ✅ 백엔드 인터셉터가 { data: {...} } 형태로 래핑하는 경우 처리
    let userData: GetUserInfoResponse;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // 인터셉터 래핑된 경우: { data: { email, nickname, ... } }
      console.log("[Profile] getUserInfo - 인터셉터 래핑된 응답 감지, response.data.data 사용");
      userData = response.data.data;
    } else {
      // 직접 응답: { email, nickname, ... }
      console.log("[Profile] getUserInfo - 직접 응답, response.data 사용");
      userData = response.data;
    }
    
    // ✅ 백엔드 응답에서 프로필 이미지 필드명이 다를 수 있음
    // profileImage, profileUrl, profile_image, imageUrl 등 다양한 필드명 지원
    const profileImageValue = 
      userData?.profileImage || 
      userData?.profileUrl || 
      userData?.profile_image || 
      userData?.imageUrl ||
      userData?.profileImageUrl ||
      null;
    
    console.log("[Profile] getUserInfo - 파싱된 사용자 정보:", {
      email: userData?.email,
      nickname: userData?.nickname,
      profileImage: userData?.profileImage,
      profileUrl: userData?.profileUrl,
      profile_image: userData?.profile_image,
      imageUrl: userData?.imageUrl,
      profileImageUrl: userData?.profileImageUrl,
      최종_profileImage: profileImageValue,
      전체데이터: userData,
      전체데이터_키목록: userData ? Object.keys(userData) : [],
    });
    
    // ✅ 프로필 이미지 필드를 통일하여 반환
    return {
      ...userData,
      profileImage: profileImageValue,
      profileUrl: profileImageValue,
    };
  } catch (error) {
    console.error("[Profile] getUserInfo - ❌ 사용자 정보 조회 실패:", error);
    throw error;
  }
}

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 닉네임 업데이트
   * 백엔드 라우트: PATCH /api/users/nickname
   */
  const updateNickname = async (nickname: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[Profile] updateNickname - 요청 시작:", {
        nickname,
        endpoint: "/users/nickname",
      });
      
      const response = await apiFetch<UpdateNicknameResponse>(
        "/users/nickname",
        {
          method: "PATCH",
          body: JSON.stringify({ nickname }),
        }
      );
      
      console.log("[Profile] updateNickname - ✅ 성공:", {
        status: response.status,
        statusText: response.statusText,
        responseData: response.data,
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Update nickname failed");
      console.error("[Profile] updateNickname - ❌ 실패:", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 프로필 이미지 업데이트
   * 백엔드 라우트: PATCH /api/users/profile
   */
  const updateProfile = async (profileImage: File | string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[Profile] updateProfile - 요청 시작:", {
        hasImage: !!profileImage,
        imageType: profileImage instanceof File ? "File" : typeof profileImage,
        endpoint: "/users/profile",
      });
      
      let body: FormData | string;
      let headers: Record<string, string> = {};
      
      if (profileImage instanceof File) {
        // File 객체인 경우 FormData로 전송
        body = new FormData();
        body.append("profileImage", profileImage);
        // FormData는 Content-Type을 브라우저가 자동으로 설정하므로 헤더에 포함하지 않음
      } else if (typeof profileImage === "string") {
        // base64 문자열인 경우 JSON으로 전송
        body = JSON.stringify({ profileImage });
        headers["Content-Type"] = "application/json";
      } else {
        // null인 경우 프로필 이미지 제거
        body = JSON.stringify({ profileImage: null });
        headers["Content-Type"] = "application/json";
      }
      
      const response = await apiFetch<UpdateProfileResponse>(
        "/users/profile",
        {
          method: "PATCH",
          body,
          headers,
        }
      );
      
      console.log("[Profile] updateProfile - ✅ 성공:", {
        status: response.status,
        statusText: response.statusText,
        responseData: response.data,
      });
      
      setError(null);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Update profile failed");
      console.error("[Profile] updateProfile - ❌ 실패:", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<UpdatePasswordResponse>(
        "/api/profile/password",
        {
          method: "PATCH",
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      setError(null);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Update password failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateNickname,
    updateProfile,
    updatePassword,
    isLoading,
    error,
  };
}

