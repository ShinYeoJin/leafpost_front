import { useState, useCallback } from "react";
import { getEmails, type Email, type EmailStatus } from "@/lib/api/emails";

export function useEmails(initialStatus?: EmailStatus) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmails = useCallback(async (status?: EmailStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getEmails(status);
      setEmails(response);
      setError(null);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Get emails failed");
      setError(error);
      setEmails([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    emails,
    isLoading,
    error,
    fetchEmails,
  };
}

