"use client";

import { useState, useEffect, useRef } from "react";
import { previewEmail, sendEmail } from "@/lib/api/emails";

type MailCardProps = {
  backgroundUrl?: string;
  villagerStickerUrl: string;
  villagerName: string;
  speechBubbleText: string;
  textSafeAreaContent?: string;
  villagerId: number;
  originalText?: string;
  toneType?: string;
  onSendNow?: () => void;
  onScheduleSend?: (scheduledDate: Date) => void;
};

export default function MailCard({
  backgroundUrl,
  villagerStickerUrl,
  villagerName,
  speechBubbleText,
  textSafeAreaContent,
  villagerId,
  originalText = "",
  toneType,
  onSendNow,
  onScheduleSend,
}: MailCardProps) {
  const [previewText, setPreviewText] = useState<string>("");
  const [transformedText, setTransformedText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedText = originalText.trim();

    if (!trimmedText) {
      setPreviewText("");
      setPreviewError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPreviewError(null);

    // ✅ 이 MailCard는 단순 미리보기 용도이므로,
    //    서버 Preview API 변경으로 인한 500을 피하기 위해
    //    클라이언트에서만 미리보기를 생성합니다.
    debounceTimerRef.current = setTimeout(() => {
      try {
        // toneType이 없더라도 여기서는 단순 텍스트 미리보기만 사용
        console.log(
          `[MailCard] 클라이언트 미리보기 생성 - villagerId: ${villagerId}, toneType: ${toneType}, originalText: ${trimmedText.substring(
            0,
            50
          )}...`
        );
        setPreviewText(trimmedText);
        setPreviewError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Preview failed");
        console.error(`[MailCard] 클라이언트 미리보기 실패:`, error);
        setPreviewError(error.message);
        setPreviewText("");
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [originalText, villagerId, toneType]);

  // imageUrl 변경 시 로딩 상태 리셋
  useEffect(() => {
    if (imageUrl) {
      setIsImageLoading(true);
      setIsImageError(false);
    }
  }, [imageUrl]);

  const displayText = transformedText || previewText || speechBubbleText;

  const applyRuleFallback = (text: string): string => {
    return text
      .replace(/\./g, "~")
      .replace(/!/g, "!")
      .replace(/\?/g, "?");
  };

  const handleSendNow = async () => {
    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      if (!toneType || !toneType.trim()) {
        console.error(
          `[MailCard] handleSendNow - toneType 누락 (villagerId: ${villagerId}, toneType: ${toneType})`
        );
        setSendError("말투 정보를 찾을 수 없습니다. 다시 시도해주세요.");
        setTimeout(() => {
          setSendError(null);
        }, 5000);
        setIsSending(false);
        return;
      }

      const content = previewText || originalText || speechBubbleText;

      // 받는 사람 이메일은 현재 로그인한 사용자의 이메일로 설정 (자기 자신에게 보내기)
      let receiverEmail = "";
      if (typeof window !== "undefined") {
        receiverEmail = localStorage.getItem("userEmail") || "";
      }

      if (!receiverEmail) {
        setSendError("받는 사람 이메일 정보를 찾을 수 없습니다. 이메일 작성 페이지에서 다시 시도해주세요.");
        setTimeout(() => {
          setSendError(null);
        }, 5000);
        setIsSending(false);
        return;
      }
      
      const now = new Date();
      const payload = {
        villagerId,
        receiverEmail,
        originalText: content,
        toneType,
        scheduledAt: now.toISOString(),
        subject: textSafeAreaContent?.trim() || "", // subject optional (textSafeAreaContent 사용 또는 빈 문자열)
      };
      
      console.log(`[MailCard] sendEmail (즉시 전송) - payload:`, JSON.stringify(payload, null, 2));
      
      // POST /emails 호출
      const response = await sendEmail(payload);

      // 서버에서 반환한 imageUrl 처리
      if (response.imageUrl) {
        setIsImageLoading(true);
        setIsImageError(false);
        setImageUrl(response.imageUrl);
        // 이미지 로드 완료는 VillagerSticker의 onLoad에서 처리
      }

      // 서버 GPT 기반 말투 변환 반영
      if (response.transformedText) {
        // 성공 시 transformedText 상태 업데이트
        setTransformedText(response.transformedText);
        setSendSuccess("이메일이 성공적으로 전송되었습니다. (GPT 변환 적용)");
      } else {
        // GPT 변환이 없으면 Rule fallback 적용
        const fallbackText = applyRuleFallback(content);
        setTransformedText(fallbackText);
        setSendSuccess("이메일이 성공적으로 전송되었습니다. (Rule fallback 적용)");
      }
      
      onSendNow?.();
      
      setTimeout(() => {
        setSendSuccess(null);
      }, 3000);
    } catch (err) {
      // 실패 시 Rule fallback 적용
      const originalContent = previewText || originalText || speechBubbleText;
      const fallbackText = applyRuleFallback(originalContent);
      setTransformedText(fallbackText);
      
      const errorMessage = err instanceof Error ? err.message : "이메일 전송에 실패했습니다.";
      setSendError(`${errorMessage} (Rule fallback 적용)`);
      setTimeout(() => {
        setSendError(null);
      }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleSend = async () => {
    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      if (!toneType || !toneType.trim()) {
        console.error(
          `[MailCard] handleScheduleSend - toneType 누락 (villagerId: ${villagerId}, toneType: ${toneType})`
        );
        setSendError("말투 정보를 찾을 수 없습니다. 다시 시도해주세요.");
        setTimeout(() => {
          setSendError(null);
        }, 5000);
        setIsSending(false);
        return;
      }

      const content = previewText || originalText || speechBubbleText;

      // 받는 사람 이메일은 현재 로그인한 사용자의 이메일로 설정 (자기 자신에게 예약 전송)
      let receiverEmail = "";
      if (typeof window !== "undefined") {
        receiverEmail = localStorage.getItem("userEmail") || "";
      }

      if (!receiverEmail) {
        setSendError("받는 사람 이메일 정보를 찾을 수 없습니다. 이메일 작성 페이지에서 다시 시도해주세요.");
        setTimeout(() => {
          setSendError(null);
        }, 5000);
        setIsSending(false);
        return;
      }

      const scheduledAt = new Date();
      scheduledAt.setHours(scheduledAt.getHours() + 1);

      const payload = {
        villagerId,
        receiverEmail,
        originalText: content,
        toneType,
        scheduledAt: scheduledAt.toISOString(),
        subject: textSafeAreaContent?.trim() || "", // subject optional (textSafeAreaContent 사용 또는 빈 문자열)
      };
      
      console.log(`[MailCard] sendEmail (예약 전송) - payload:`, JSON.stringify(payload, null, 2));

      // POST /emails 호출 (예약 전송)
      const response = await sendEmail(payload);

      // 서버에서 반환한 imageUrl 처리
      if (response.imageUrl) {
        setIsImageLoading(true);
        setIsImageError(false);
        setImageUrl(response.imageUrl);
        // 이미지 로드 완료는 VillagerSticker의 onLoad에서 처리
      }

      // 서버 GPT 기반 말투 변환 반영
      if (response.transformedText) {
        // 성공 시 transformedText 상태 업데이트
        setTransformedText(response.transformedText);
        setSendSuccess(`이메일이 ${scheduledAt.toLocaleString()}에 전송 예약되었습니다. (GPT 변환 적용)`);
      } else {
        // GPT 변환이 없으면 Rule fallback 적용
        const fallbackText = applyRuleFallback(content);
        setTransformedText(fallbackText);
        setSendSuccess(`이메일이 ${scheduledAt.toLocaleString()}에 전송 예약되었습니다. (Rule fallback 적용)`);
      }
      
      onScheduleSend?.(scheduledAt);
      
      setTimeout(() => {
        setSendSuccess(null);
      }, 3000);
    } catch (err) {
      // 실패 시 Rule fallback 적용
      const originalContent = previewText || originalText || speechBubbleText;
      const fallbackText = applyRuleFallback(originalContent);
      setTransformedText(fallbackText);
      
      const errorMessage = err instanceof Error ? err.message : "이메일 예약에 실패했습니다.";
      setSendError(`${errorMessage} (Rule fallback 적용)`);
      setTimeout(() => {
        setSendError(null);
      }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleDelete = () => {
    // Mock 환경에서도 삭제 동작 시뮬레이션
    setSendSuccess("이메일이 삭제되었습니다.");
    setIsModalOpen(false);
    
    // 부모 컴포넌트에 삭제 알림 (필요시)
    // onDelete?.();
    
    setTimeout(() => {
      setSendSuccess(null);
    }, 3000);
  };

  return (
    <div
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto
                 rounded-2xl shadow-lg overflow-hidden 
                 transition-all duration-300 ease-in-out
                 hover:-translate-y-2 hover:shadow-2xl
                 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Background backgroundUrl={backgroundUrl} />
      <VillagerSticker
        villagerStickerUrl={imageUrl || villagerStickerUrl}
        villagerName={villagerName}
        hovered={hovered}
        isLoading={isImageLoading}
        isImageError={isImageError}
        onLoad={() => {
          setIsImageLoading(false);
          setIsImageError(false);
        }}
        onError={() => {
          setIsImageLoading(false);
          setIsImageError(true);
        }}
      />
      <SpeechBubble text={displayText} hovered={hovered} />
      {textSafeAreaContent && <TextSafeArea content={textSafeAreaContent} hovered={hovered} />}
      
      {/* Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={handleSendNow}
          disabled={isSending}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 
                     font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 
                     focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-md hover:shadow-lg active:scale-95"
        >
          {isSending ? "전송 중..." : "즉시 전송"}
        </button>
        <button
          onClick={handleScheduleSend}
          disabled={isSending}
          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 
                     font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 
                     focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-md hover:shadow-lg active:scale-95"
        >
          {isSending ? "예약 중..." : "예약 전송"}
        </button>
        <button
          onClick={openModal}
          className="px-3 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg 
                     hover:bg-red-600 dark:hover:bg-red-700 
                     transition-all duration-200 shadow-md hover:shadow-lg active:scale-95
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          삭제
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm 
                        flex items-center justify-center z-40 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-zinc-300 dark:border-zinc-600 
                            border-t-zinc-900 dark:border-t-zinc-50 rounded-full animate-spin" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              미리보기 생성 중...
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {sendSuccess && (
        <div className="absolute top-4 left-4 right-4 bg-green-500 dark:bg-green-600 
                        text-white text-sm p-3 rounded-lg shadow-xl z-50
                        animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">{sendSuccess}</p>
          </div>
        </div>
      )}

      {/* Preview Error Message */}
      {previewError && (
        <div className="absolute top-4 left-4 right-4 bg-amber-500 dark:bg-amber-600 
                        text-white text-sm p-3 rounded-lg shadow-xl z-50
                        animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">미리보기: {previewError}</p>
          </div>
        </div>
      )}

      {/* Send Error Message */}
      {sendError && (
        <div className="absolute top-4 left-4 right-4 bg-red-500 dark:bg-red-600 
                        text-white text-sm p-3 rounded-lg shadow-xl z-50
                        animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="font-medium">{sendError}</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm
                       transition-opacity duration-300"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-zinc-900 p-6 rounded-2xl z-[101] 
                          w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800
                          animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
              삭제 확인
            </h3>
            <p className="mb-6 text-zinc-700 dark:text-zinc-300">
              정말 이 메일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 
                           rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 
                           transition-all duration-200 font-medium"
                onClick={closeModal}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg 
                           hover:bg-red-600 dark:hover:bg-red-700 
                           transition-all duration-200 font-medium shadow-md"
                onClick={handleDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Background */
type BackgroundProps = { backgroundUrl?: string };
function Background({ backgroundUrl }: BackgroundProps) {
  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
      {backgroundUrl ? (
        <img
          src={backgroundUrl}
          alt="Background"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 
                        dark:from-zinc-800 dark:to-zinc-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                      dark:from-black/40" />
    </div>
  );
}

/* VillagerSticker */
type VillagerStickerProps = { 
  villagerStickerUrl: string; 
  villagerName: string;
  hovered: boolean;
  isLoading?: boolean;
  isImageError?: boolean;
  onLoad?: () => void;
  onError?: () => void;
};
function VillagerSticker({ 
  villagerStickerUrl, 
  villagerName, 
  hovered, 
  isLoading = false,
  isImageError = false,
  onLoad,
  onError,
}: VillagerStickerProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    onError?.();
  };

  return (
    <div className={`absolute top-4 left-4 transition-all duration-300 
                    ${hovered ? 'scale-110 translate-y-[-4px]' : 'scale-100'}`}>
      <div className="relative drop-shadow-lg">
        {(isLoading || imageLoading) && !imageError && !isImageError ? (
          <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px]
                         flex items-center justify-center bg-zinc-200/50 dark:bg-zinc-700/50 
                         rounded-full animate-pulse">
            <div className="w-8 h-8 border-2 border-zinc-400 dark:border-zinc-500 
                           border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (imageError || isImageError) ? (
          <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px]
                         flex items-center justify-center bg-zinc-200/50 dark:bg-zinc-700/50 
                         rounded-full">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">이미지 없음</span>
          </div>
        ) : (
          <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px]
                         rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
            <img
              src={villagerStickerUrl}
              alt={villagerName}
              className="w-full h-full object-contain transition-transform duration-300"
              style={{ objectPosition: 'center' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* SpeechBubble */
type SpeechBubbleProps = { text: string; hovered: boolean };
function SpeechBubble({ text, hovered }: SpeechBubbleProps) {
  return (
    <div
      className={`absolute top-32 sm:top-36 md:top-40 left-4 right-4 
                  bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm
                  rounded-xl shadow-lg p-4 sm:p-5 
                  border-2 border-zinc-200 dark:border-zinc-700
                  transition-all duration-300 ease-in-out
                  ${hovered 
                    ? 'opacity-100 scale-105 shadow-2xl border-zinc-300 dark:border-zinc-600' 
                    : 'opacity-80 scale-100'}`}
    >
      <p className="text-sm sm:text-base text-zinc-900 dark:text-zinc-50 
                    leading-relaxed font-medium">
        {text}
      </p>
      {hovered && (
        <div className="absolute -bottom-2 left-8 w-0 h-0 
                        border-l-8 border-r-8 border-t-8 
                        border-transparent border-t-white dark:border-t-zinc-900 
                        transition-opacity duration-300" />
      )}
    </div>
  );
}

/* TextSafeArea */
type TextSafeAreaProps = { content: string; hovered: boolean };
function TextSafeArea({ content, hovered }: TextSafeAreaProps) {
  return (
    <div className={`absolute bottom-20 sm:bottom-24 left-4 right-4 
                    bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm
                    rounded-xl p-4 sm:p-5 shadow-lg
                    border border-zinc-200 dark:border-zinc-700
                    transition-all duration-300 ease-in-out
                    ${hovered 
                      ? 'opacity-100 scale-105 shadow-xl border-zinc-300 dark:border-zinc-600' 
                      : 'opacity-90 scale-100'}`}>
      <p className="text-sm sm:text-base font-semibold 
                    text-zinc-900 dark:text-zinc-50 
                    line-clamp-2">
        {content}
      </p>
    </div>
  );
}
