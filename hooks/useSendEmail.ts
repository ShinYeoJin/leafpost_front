import { useState } from "react";
import { sendEmail, type SendEmailRequest, type SendEmailResponse } from "@/lib/api/emails";

export function useSendEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sentEmail, setSentEmail] = useState<SendEmailResponse | null>(null);

  const handleSendEmail = async (payload: SendEmailRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendEmail(payload);
      setSentEmail(response);
      setError(null);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Send email failed");
      setError(error);
      setSentEmail(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSendEmail,
    isLoading,
    error,
    sentEmail,
  };
}

