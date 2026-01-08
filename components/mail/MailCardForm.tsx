"use client";

import { useState, useEffect, useRef } from "react";
import { sendEmail, previewEmailCard } from "@/lib/api/emails";
import PreviewCard from "@/components/mail/PreviewCard";

type MailCardFormProps = {
  villagerStickerUrl: string;
  villagerName: string;
  villagerId: number;
  villagerCatchphrase: string;
  villagerToneType: string;
  onSendNow?: () => void;
  onScheduleSend?: (scheduledDate: Date) => void;
};

export default function MailCardForm({
  villagerStickerUrl,
  villagerName,
  villagerId,
  villagerCatchphrase,
  villagerToneType,
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
  
  // 필드별 에러 상태
  const [fieldErrors, setFieldErrors] = useState<{
    content?: string;
    toEmail?: string;
    subject?: string;
  }>({});

  // 미리보기 카드 상태
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 사용자 이메일 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userEmail = localStorage.getItem("userEmail") || "";
      setFromEmail(userEmail);
    }
  }, []);

  // content 변경 시 debounce로 preview API 호출
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!content.trim()) {
      setPreviewImageUrl("");
      setPreviewText("");
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    // receiverEmail 검증 (Preview API에서 필수)
    if (!toEmail.trim()) {
      setPreviewImageUrl("");
      setPreviewText("");
      setPreviewError("받는 사람 주소를 입력해주세요.");
      setIsPreviewLoading(false);
      return;
    }

    // toneType 검증
    if (!villagerToneType || !villagerToneType.trim()) {
      console.error(
        `[MailCardForm] previewEmailCard - toneType 누락 (villagerId: ${villagerId}, villagerToneType: ${villagerToneType})`
      );
      setPreviewError("말투 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
      setIsPreviewLoading(false);
      return;
    }

    setIsPreviewLoading(true);
    setPreviewError(null);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log(
          `[MailCardForm] previewEmailCard 호출 - villagerId: ${villagerId}, toneType: ${villagerToneType}, originalText: ${content.trim().substring(0, 50)}...`
        );
        
        const trimmedEmail = toEmail.trim();
        
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          setPreviewError("유효한 이메일 형식을 입력해주세요.");
          setIsPreviewLoading(false);
          return;
        }
        
        // 이메일 길이 검증 (255자 이하)
        if (trimmedEmail.length > 255) {
          setPreviewError("이메일 주소는 255자 이하여야 합니다.");
          setIsPreviewLoading(false);
          return;
        }
        
        const response = await previewEmailCard(
          villagerId,
          content.trim(),
          villagerToneType,
          trimmedEmail // receiverEmail 추가
        );
        setPreviewImageUrl(response.previewImageUrl);
        setPreviewText(response.previewText);
        setPreviewError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Preview failed");
        console.error(`[MailCardForm] previewEmailCard 실패:`, error);
        setPreviewError(error.message);
        setPreviewImageUrl("");
        setPreviewText("");
      } finally {
        setIsPreviewLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, villagerId, villagerToneType, toEmail]); // toEmail 추가 (preview 시 receiverEmail 필요)

  const handleSendNow = async () => {
    // 필드별 에러 초기화
    const newFieldErrors: {
      content?: string;
      toEmail?: string;
      subject?: string;
    } = {};
    
    // 유효성 검사
    if (!content.trim()) {
      newFieldErrors.content = "내용을 입력해주세요.";
    }
    if (!toEmail.trim()) {
      newFieldErrors.toEmail = "받는 사람 주소를 입력해주세요.";
    } else {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = toEmail.trim();
      if (!emailRegex.test(trimmedEmail)) {
        newFieldErrors.toEmail = "유효한 이메일 형식을 입력해주세요.";
      } else if (trimmedEmail.length > 255) {
        newFieldErrors.toEmail = "이메일 주소는 255자 이하여야 합니다.";
      }
    }
    
    // subject 검증 (백엔드에서 필수)
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      newFieldErrors.subject = "제목을 입력해주세요.";
    } else if (trimmedSubject.length > 255) {
      newFieldErrors.subject = "제목은 255자 이하여야 합니다.";
    }

    // 에러가 있으면 필드별 에러 표시 후 중단
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setSendError("필수 입력 항목을 모두 입력해주세요.");
      setTimeout(() => setSendError(null), 5000);
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = document.querySelector('[data-error-field]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 에러 없으면 필드별 에러 초기화
    setFieldErrors({});
    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      // toneType 검증
      if (!villagerToneType || !villagerToneType.trim()) {
        setSendError("말투 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
        setTimeout(() => setSendError(null), 5000);
        setIsSending(false);
        return;
      }

      // 유저가 입력한 내용을 주민 말투로 변환하여 전송
      const now = new Date();
      const payload = {
        villagerId,
        receiverEmail: toEmail.trim(),
        originalText: content.trim(),
        toneType: villagerToneType.trim(), // villagerToneType 사용 (백엔드에서 받은 값)
        scheduledAt: now.toISOString(), // 즉시 전송 시 현재 시간
        subject: subject.trim() || "제목 없음", // subject 필수 (비어있으면 기본값)
      };
      
      console.log(`[MailCardForm] sendEmail (즉시 전송) - villagerToneType 값:`, villagerToneType);
      console.log(`[MailCardForm] sendEmail (즉시 전송) - payload:`, JSON.stringify(payload, null, 2));
      
      await sendEmail(payload);

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
    // 필드별 에러 초기화
    const newFieldErrors: {
      content?: string;
      toEmail?: string;
      subject?: string;
    } = {};
    
    if (!scheduledDateTime) {
      setSendError("예약 날짜/시간을 선택해주세요.");
      setTimeout(() => setSendError(null), 3000);
      return;
    }

    // 유효성 검사
    if (!content.trim()) {
      newFieldErrors.content = "내용을 입력해주세요.";
    }
    if (!toEmail.trim()) {
      newFieldErrors.toEmail = "받는 사람 주소를 입력해주세요.";
    } else {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = toEmail.trim();
      if (!emailRegex.test(trimmedEmail)) {
        newFieldErrors.toEmail = "유효한 이메일 형식을 입력해주세요.";
      } else if (trimmedEmail.length > 255) {
        newFieldErrors.toEmail = "이메일 주소는 255자 이하여야 합니다.";
      }
    }
    
    // subject 검증 (백엔드에서 필수)
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      newFieldErrors.subject = "제목을 입력해주세요.";
    } else if (trimmedSubject.length > 255) {
      newFieldErrors.subject = "제목은 255자 이하여야 합니다.";
    }

    // 에러가 있으면 필드별 에러 표시 후 중단
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setSendError("필수 입력 항목을 모두 입력해주세요.");
      setTimeout(() => setSendError(null), 5000);
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = document.querySelector('[data-error-field]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 에러 없으면 필드별 에러 초기화
    setFieldErrors({});
    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      // toneType 검증
      if (!villagerToneType || !villagerToneType.trim()) {
        setSendError("말투 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
        setTimeout(() => setSendError(null), 5000);
        setIsSending(false);
        return;
      }

      const scheduledAt = new Date(scheduledDateTime);
      
      // 유저가 입력한 내용을 주민 말투로 변환하여 예약 전송
      const payload = {
        villagerId,
        receiverEmail: toEmail.trim(),
        originalText: content.trim(),
        toneType: villagerToneType.trim(), // villagerToneType 사용 (백엔드에서 받은 값)
        scheduledAt: scheduledAt.toISOString(),
        subject: subject.trim() || "제목 없음", // subject 필수 (비어있으면 기본값)
      };
      
      console.log(`[MailCardForm] sendEmail (예약 전송) - villagerToneType 값:`, villagerToneType);
      console.log(`[MailCardForm] sendEmail (예약 전송) - payload:`, JSON.stringify(payload, null, 2));
      
      await sendEmail(payload);

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
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 max-w-6xl w-full border-2 border-sky-100 max-h-[90vh] overflow-y-auto">
      {/* 주민 이미지 (왼쪽 상단) */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative w-20 h-20 flex-shrink-0">
          {isSending ? (
            <div className="w-full h-full flex items-center justify-center bg-sky-100 rounded-full animate-pulse border-2 border-sky-200 overflow-hidden">
              <img
                src={villagerStickerUrl}
                alt={villagerName}
                className="w-full h-full object-contain rounded-full animate-spin"
                style={{ animationDuration: "2s" }}
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-full border-2 border-sky-200 overflow-hidden">
              <img
                src={villagerStickerUrl}
                alt={villagerName}
                className="w-full h-full object-contain rounded-full"
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

      {/* 입력 폼과 미리보기 카드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* 입력 폼 섹션 */}
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
            onChange={(e) => {
              setToEmail(e.target.value);
              if (fieldErrors.toEmail) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.toEmail;
                  return newErrors;
                });
              }
            }}
            data-error-field={fieldErrors.toEmail ? "true" : undefined}
            className={`w-full px-4 py-2 border-2 rounded-lg 
                     bg-white text-zinc-900
                     focus:outline-none focus:ring-2 ${
                       fieldErrors.toEmail
                         ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                         : "border-sky-200 focus:ring-sky-400 focus:border-sky-400"
                     }`}
            placeholder="받는 사람 이메일 주소"
            disabled={isSending}
            required
          />
          {fieldErrors.toEmail && (
            <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.toEmail}</p>
          )}
        </div>

        {/* 제목 (필수) */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            제목 <span className="text-red-500 text-xs">(필수)</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              // 입력 시 에러 제거
              if (fieldErrors.subject) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.subject;
                  return newErrors;
                });
              }
            }}
            data-error-field={fieldErrors.subject ? "true" : undefined}
            className={`w-full px-4 py-2 border-2 rounded-lg 
                     bg-white text-zinc-900
                     focus:outline-none focus:ring-2 ${
                       fieldErrors.subject
                         ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                         : "border-sky-200 focus:ring-sky-400 focus:border-sky-400"
                     }`}
            placeholder="이메일 제목 (필수)"
            disabled={isSending}
            required
            maxLength={255}
          />
          {fieldErrors.subject && (
            <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.subject}</p>
          )}
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (fieldErrors.content) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.content;
                  return newErrors;
                });
              }
            }}
            data-error-field={fieldErrors.content ? "true" : undefined}
            rows={6}
            className={`w-full px-4 py-2 border-2 rounded-lg 
                     bg-white text-zinc-900
                     focus:outline-none focus:ring-2 resize-none ${
                       fieldErrors.content
                         ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                         : "border-sky-200 focus:ring-sky-400 focus:border-sky-400"
                     }`}
            placeholder={`${villagerName}의 말투로 변환될 내용을 입력해주세요.`}
            disabled={isSending}
            required
          />
          {fieldErrors.content && (
            <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.content}</p>
          )}
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

        {/* 미리보기 카드 섹션 */}
        <div className="flex flex-col items-center justify-start">
          <h4 className="text-lg font-semibold text-zinc-700 mb-4 w-full text-center lg:text-left">
            미리보기
          </h4>
          {content.trim() ? (
            <PreviewCard
              previewImageUrl={previewImageUrl}
              previewText={previewText}
              isLoading={isPreviewLoading}
              error={previewError}
            />
          ) : (
            <div className="w-full max-w-[360px] sm:max-w-[380px] md:max-w-[400px] aspect-[400/520] 
                            flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100 
                            rounded-2xl border-2 border-dashed border-sky-200">
              <div className="text-center px-4">
                <span className="text-4xl mb-2 block">💌</span>
                <p className="text-sm text-sky-600 font-medium">
                  내용을 입력하면<br />미리보기가 표시됩니다
                </p>
              </div>
            </div>
          )}
        </div>
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
                        text-red-800 rounded-lg text-sm font-medium
                        animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{sendError}</p>
          </div>
        </div>
      )}
    </div>
  );
}

