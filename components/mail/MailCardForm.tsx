"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { sendEmail } from "@/lib/api/emails";

type MailCardFormProps = {
  villagerStickerUrl: string;
  villagerName: string;
  villagerId: number;
  villagerCatchphrase: string;
  onSendNow?: () => void;
  onScheduleSend?: (scheduledDate: Date) => void;
};

export default function MailCardForm({
  villagerStickerUrl,
  villagerName,
  villagerId,
  villagerCatchphrase,
  onSendNow,
  onScheduleSend,
}: MailCardFormProps) {
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  
  // 입력 필드 상태
  const [content, setContent] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");

  // 컴포넌트 마운트 시 사용자 이메일 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userEmail = localStorage.getItem("userEmail") || "";
      setFromEmail(userEmail);
    }
  }, []);

  const handleSendNow = async () => {
    // 유효성 검사
    if (!content.trim()) {
      setSendError("내용을 입력해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }
    if (!toEmail.trim()) {
      setSendError("받는 사람 주소를 입력해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }
    if (!subject.trim()) {
      setSendError("제목을 입력해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }

    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      // 유저가 입력한 내용을 주민 말투로 변환하여 전송
      await sendEmail({
        villagerId,
        subject: subject.trim(),
        content: content.trim(),
        fromEmail: fromEmail.trim(),
        toEmail: toEmail.trim(),
      });

      setSendSuccess("이메일이 성공적으로 전송되었습니다.");
      onSendNow?.();
      
      // 전송 성공 후 폼 초기화
      setContent("");
      setToEmail("");
      setSubject("");
      
      setTimeout(() => {
        setSendSuccess(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "이메일 전송에 실패했습니다.";
      setSendError(errorMessage);
      setTimeout(() => {
        setSendError(null);
      }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleSend = async () => {
    if (!scheduledDateTime) {
      setSendError("예약 날짜/시간을 선택해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }

    // 유효성 검사
    if (!content.trim()) {
      setSendError("내용을 입력해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }
    if (!toEmail.trim()) {
      setSendError("받는 사람 주소를 입력해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }
    if (!subject.trim()) {
      setSendError("제목을 입력해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }

    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      const scheduledAt = new Date(scheduledDateTime);
      
      // 유저가 입력한 내용을 주민 말투로 변환하여 예약 전송
      await sendEmail({
        villagerId,
        subject: subject.trim(),
        content: content.trim(),
        scheduledAt: scheduledAt.toISOString(),
        fromEmail: fromEmail.trim(),
        toEmail: toEmail.trim(),
      });

      setSendSuccess(`이메일이 ${scheduledAt.toLocaleString()}에 전송 예약되었습니다.`);
      onScheduleSend?.(scheduledAt);
      
      // 예약 성공 후 폼 초기화
      setContent("");
      setToEmail("");
      setSubject("");
      setScheduledDateTime("");
      setShowScheduleForm(false);
      
      setTimeout(() => {
        setSendSuccess(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "이메일 예약에 실패했습니다.";
      setSendError(errorMessage);
      setTimeout(() => {
        setSendError(null);
      }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  // 날짜/시간 기본값 설정 (현재 시간 + 1시간)
  const getDefaultDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date.toISOString().slice(0, 16);
  };

  const [defaultDateTime] = useState(getDefaultDate());

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 max-w-2xl w-full border-2 border-sky-100 max-h-[90vh] overflow-y-auto">
      {/* 주민 이미지 (왼쪽 상단) */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative w-20 h-20 flex-shrink-0">
          {isSending ? (
            <div className="w-full h-full flex items-center justify-center bg-sky-100 rounded-full animate-pulse border-2 border-sky-200">
              <Image
                src={villagerStickerUrl}
                alt={villagerName}
                width={80}
                height={80}
                className="object-contain rounded-full animate-spin"
                style={{ animationDuration: "2s" }}
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-full border-2 border-sky-200 overflow-hidden">
              <Image
                src={villagerStickerUrl}
                alt={villagerName}
                width={80}
                height={80}
                className="object-contain rounded-full"
              />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900 mb-1">
            {villagerName}의 편지 보내기
          </h3>
          <p className="text-sm text-zinc-600">
            {villagerName}의 말투로 변환되어 전송됩니다.
          </p>
          <div className="mt-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
            <p className="text-sm text-zinc-700">
              <span className="font-medium text-sky-600">{villagerName} 버전:</span> {villagerCatchphrase || `${villagerName}의 인사말`}
            </p>
            <p className="text-xs text-zinc-500 mt-1 italic">
              * 위 문구는 {villagerName}의 말투 예시입니다. 실제 전송 내용은 아래 입력 필드에 작성하신 내용입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-4">
        {/* 보내는 사람 주소 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            보내는 사람 주소
          </label>
          <input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            className="w-full px-4 py-2 border-2 border-sky-200 rounded-lg 
                     bg-white text-zinc-900
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            placeholder="보내는 사람 이메일 주소"
            disabled={isSending}
          />
        </div>

        {/* 받는 사람 주소 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            받는 사람 주소 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="w-full px-4 py-2 border-2 border-sky-200 rounded-lg 
                     bg-white text-zinc-900
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            placeholder="받는 사람 이메일 주소"
            disabled={isSending}
            required
          />
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border-2 border-sky-200 rounded-lg 
                     bg-white text-zinc-900
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            placeholder="이메일 제목"
            disabled={isSending}
            required
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border-2 border-sky-200 rounded-lg 
                     bg-white text-zinc-900
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-none"
            placeholder={`${villagerName}의 말투로 변환될 내용을 입력해주세요.`}
            disabled={isSending}
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            입력한 내용이 {villagerName}의 말투로 자동 변환되어 전송됩니다.
          </p>
        </div>

        {/* 예약 전송 폼 */}
        {showScheduleForm && (
          <div className="p-4 bg-sky-50 rounded-lg space-y-3 border border-sky-200">
            <label className="block text-sm font-medium text-zinc-700">
              예약 전송 날짜/시간
            </label>
            <input
              type="datetime-local"
              value={scheduledDateTime || defaultDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border-2 border-sky-200 rounded-lg 
                       bg-white text-zinc-900
                       focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              disabled={isSending}
            />
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSendNow}
          disabled={isSending}
          className="flex-1 px-4 py-3 bg-sky-300 text-white 
                   font-medium rounded-lg hover:bg-sky-400 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSending ? "전송 중..." : "즉시 전송"}
        </button>
        <button
          onClick={() => {
            if (showScheduleForm) {
              handleScheduleSend();
            } else {
              setShowScheduleForm(true);
            }
          }}
          disabled={isSending}
          className="flex-1 px-4 py-3 bg-yellow-300 text-white 
                   font-medium rounded-lg hover:bg-yellow-400 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSending ? "예약 중..." : showScheduleForm ? "예약 전송하기" : "예약 전송"}
        </button>
      </div>

      {/* 성공/에러 메시지 */}
      {sendSuccess && (
        <div className="mt-4 p-3 bg-green-100 border-2 border-green-300 
                        text-green-800 rounded-lg text-sm">
          {sendSuccess}
        </div>
      )}

      {sendError && (
        <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 
                        text-red-800 rounded-lg text-sm">
          {sendError}
        </div>
      )}
    </div>
  );
}

