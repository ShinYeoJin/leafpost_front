import { useState, useEffect, useRef } from "react";
import { previewEmail } from "@/lib/api/emails";

type UseMailPreviewOptions = {
  villagerId: number;
  originalText: string;
  debounceMs?: number;
};

export function useMailPreview({
  villagerId,
  originalText,
  debounceMs = 500,
}: UseMailPreviewOptions) {
  const [previewText, setPreviewText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!originalText.trim()) {
      setPreviewText("");
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await previewEmail(villagerId, originalText);
        setPreviewText(response.previewContent);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Preview failed");
        setError(error);
        setPreviewText("");
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [originalText, villagerId, debounceMs]);

  return {
    previewText,
    isLoading,
    error,
  };
}

