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
    // null을 undefined로 변환하여 타입 호환성 확보
    return {
      ...userData,
      profileImage: profileImageValue || undefined,
      profileUrl: profileImageValue || undefined,
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
   * 
   * 백엔드 DTO 요구사항:
   * - profileImage가 null이면 필드를 보내지 않아야 함
   * - File 객체는 FormData로 전송
   * - base64 문자열은 JSON으로 전송
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
      
      // ✅ null, undefined, 빈 문자열인 경우 프로필 이미지 제거 요청을 보내지 않음
      // 백엔드가 "property profileImage should not exist" 에러를 반환하므로
      if (!profileImage || (typeof profileImage === "string" && !profileImage.trim())) {
        console.log("[Profile] updateProfile - profileImage가 null/undefined/빈 문자열이므로 API 호출 생략:", {
          profileImage,
          type: typeof profileImage,
          isEmpty: typeof profileImage === "string" && !profileImage.trim(),
        });
        console.log("[Profile] updateProfile - 참고: 프로필 이미지 제거는 별도 API가 필요할 수 있습니다");
        setIsLoading(false);
        setError(null);
        // null인 경우 빈 응답 반환 (또는 제거 API가 있다면 호출)
        return { profileImage: undefined, profileUrl: undefined };
      }
      
      let body: FormData | string;
      let headers: Record<string, string> = {};
      
      if (profileImage instanceof File) {
        // File 객체인 경우 FormData로 전송
        body = new FormData();
        body.append("profileImage", profileImage);
        // FormData는 Content-Type을 브라우저가 자동으로 설정하므로 헤더에 포함하지 않음
        console.log("[Profile] updateProfile - File 객체를 FormData로 전송:", {
          fileName: profileImage.name,
          fileSize: profileImage.size,
          fileType: profileImage.type,
        });
      } else if (typeof profileImage === "string" && profileImage.trim()) {
        // base64 문자열인 경우 JSON으로 전송
        // ✅ base64 문자열이 유효한지 확인
        if (!profileImage.startsWith("data:image")) {
          console.warn("[Profile] updateProfile - base64 문자열이 data:image로 시작하지 않음, 그대로 전송");
        }
        body = JSON.stringify({ profileImage: profileImage.trim() });
        headers["Content-Type"] = "application/json";
        console.log("[Profile] updateProfile - base64 문자열을 JSON으로 전송:", {
          length: profileImage.length,
          preview: profileImage.substring(0, 50),
          isDataUrl: profileImage.startsWith("data:image"),
        });
      } else {
        // 예상치 못한 타입인 경우 처리하지 않음
        // ✅ 타입 가드를 명확하게 분리하여 TypeScript 오류 방지
        let isFile = false;
        if (profileImage !== null && profileImage !== undefined) {
          // 타입 단언을 사용하여 instanceof 체크 가능하도록 함
          const profileImageAsObject = profileImage as any;
          if (typeof profileImageAsObject === "object") {
            try {
              isFile = profileImageAsObject instanceof File;
            } catch {
              isFile = false;
            }
          }
        }
        console.error("[Profile] updateProfile - 예상치 못한 profileImage 타입:", {
          profileImage,
          type: typeof profileImage,
          isFile,
        });
        setIsLoading(false);
        setError(new Error("Invalid profile image type"));
        throw new Error("Invalid profile image type");
      }
      
      console.log("[Profile] updateProfile - 요청 body 타입:", {
        bodyType: body instanceof FormData ? "FormData" : typeof body,
        bodyPreview: body instanceof FormData ? "FormData" : (typeof body === "string" ? body.substring(0, 100) : body),
      });
      
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

