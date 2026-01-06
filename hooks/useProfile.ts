import { useState } from "react";
import { apiFetch } from "@/lib/api/client";

type UpdateNicknameRequest = {
  nickname: string;
};

type UpdateNicknameResponse = {
  nickname: string;
};

type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

type UpdatePasswordResponse = {
  success: boolean;
};

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateNickname = async (nickname: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<UpdateNicknameResponse>(
        "/api/profile/nickname",
        {
          method: "PATCH",
          body: JSON.stringify({ nickname }),
        }
      );
      setError(null);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Update nickname failed");
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
    updatePassword,
    isLoading,
    error,
  };
}

