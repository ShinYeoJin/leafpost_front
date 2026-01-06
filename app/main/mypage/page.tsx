"use client";

import { useState, useEffect } from "react";
import MailCardReadonly from "@/components/mail/MailCardReadonly";
import { useEmails } from "@/hooks/useEmails";
import type { Email, EmailStatus } from "@/lib/api/emails";

export default function MyPage() {
  const [filter, setFilter] = useState<"all" | "reserved" | "sent">("all");
  const { emails, isLoading, error, fetchEmails } = useEmails();

  useEffect(() => {
    const status: EmailStatus | undefined =
      filter === "all" ? undefined : filter === "reserved" ? "draft" : "sent";
    fetchEmails(status);
  }, [filter, fetchEmails]);

  const mapEmailToCardProps = (email: Email) => {
    const status = email.status === "sent" ? "sent" : "reserved";
    const speechBubbleText = email.previewContent || email.content;

    return {
      key: email.id,
      villagerStickerUrl: "", // TODO: villager 정보에서 가져오기
      villagerName: email.villagerName,
      speechBubbleText,
      textSafeAreaContent: email.subject,
      status: status as "reserved" | "sent",
      scheduledDate: email.status === "draft" ? email.createdAt : undefined,
      sentDate: email.sentAt,
      backgroundUrl: undefined, // TODO: 배경 이미지 추가
    };
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filter Buttons */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 sm:mb-6">
            내 이메일
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  filter === "all"
                    ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-md"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("reserved")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  filter === "reserved"
                    ? "bg-amber-500 dark:bg-amber-600 text-white shadow-md"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
            >
              예약됨
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  filter === "sent"
                    ? "bg-green-500 dark:bg-green-600 text-white shadow-md"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
            >
              전송됨
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-zinc-300 dark:border-zinc-600 
                              border-t-zinc-900 dark:border-t-zinc-50 rounded-full animate-spin" />
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                이메일을 불러오는 중...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                  이메일을 불러오는 중 오류가 발생했습니다.
                </p>
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error.message}
                </p>
              </div>
              <button
                onClick={() => {
                  const status: EmailStatus | undefined =
                    filter === "all" ? undefined : filter === "reserved" ? "draft" : "sent";
                  fetchEmails(status);
                }}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 
                           rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 
                           transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && emails.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium mb-2">
                이메일이 없습니다.
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {filter === "all"
                  ? "아직 작성한 이메일이 없습니다."
                  : filter === "reserved"
                  ? "예약된 이메일이 없습니다."
                  : "전송된 이메일이 없습니다."}
              </p>
            </div>
          </div>
        )}

        {/* Email Grid */}
        {!isLoading && !error && emails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {emails.map((email) => {
              const props = mapEmailToCardProps(email);
              return <MailCardReadonly {...props} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
