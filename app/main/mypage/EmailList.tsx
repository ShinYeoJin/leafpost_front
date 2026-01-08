"use client";

import { useState, useEffect } from "react";
import MailCardReadonly from "@/components/mail/MailCardReadonly";
import { getEmails, type Email } from "@/lib/api/emails";

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getEmails();
        setEmails(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err : new Error("이메일 목록을 불러오는데 실패했습니다.");
        setError(errorMessage as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sky-600 dark:text-sky-400">이메일 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            이메일을 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="text-sm text-red-500 dark:text-red-400">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            이메일이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6">
      {emails.map((email) => {
        const status = email.status === "sent" ? "sent" : "reserved";
        // transformedText를 우선 사용 (실제 전송된 주민 버전)
        const speechBubbleText = email.transformedText || email.originalText || email.previewContent || email.content || "";

        return (
          <MailCardReadonly
            key={email.id}
            villagerStickerUrl="" // TODO: villager 정보에서 가져오기
            villagerName={email.villagerName || "알 수 없는 주민"} // 기본값 제공
            speechBubbleText={speechBubbleText}
            textSafeAreaContent={email.subject}
            status={status as "reserved" | "sent"}
            scheduledDate={email.status === "draft" ? email.createdAt : undefined}
            sentDate={email.sentAt}
            backgroundUrl={undefined} // TODO: 배경 이미지 추가
          />
        );
      })}
    </div>
  );
}
