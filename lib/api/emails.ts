import { apiFetch } from "./client";

export type EmailStatus = "draft" | "sent" | "deleted";
export type Email = { id: string; villagerId: number; villagerName: string; subject: string; content: string; previewContent?: string; status: EmailStatus; createdAt: string; sentAt?: string; deletedAt?: string; scheduledAt?: string; };

export type SendEmailRequest = {
  villagerId: number;
  receiverEmail: string;
  originalText: string;
  toneType: string;
  scheduledAt: string;
  subject: string; // 백엔드에서 필수로 요구
};

export type SendEmailResponse = {
  transformedText?: string;
  imageUrl?: string;
  [key: string]: unknown;
};

/**
 * 개발 환경용 Mock Get Emails
 * CORS 문제로 인한 로컬 개발 환경에서만 사용
 */
function mockGetEmails(status?: EmailStatus): Promise<Email[]> {
  // localStorage에서 저장된 이메일 이력 가져오기 (Mock 환경)
  if (typeof window !== "undefined") {
    const storedEmails = localStorage.getItem("sentEmails");
    if (storedEmails) {
      try {
        const emails: Email[] = JSON.parse(storedEmails);
        const now = new Date();
        let updated = false;
        
        // 예약 시간이 지난 이메일을 자동으로 'sent' 상태로 업데이트
        const updatedEmails = emails.map((email) => {
          if (email.status === "draft" && email.scheduledAt) {
            const scheduledTime = new Date(email.scheduledAt);
            if (scheduledTime <= now) {
              updated = true;
              return {
                ...email,
                status: "sent" as EmailStatus,
                sentAt: email.sentAt || scheduledTime.toISOString(),
              };
            }
          }
          return email;
        });
        
        // 업데이트된 이메일이 있으면 localStorage에 저장
        if (updated) {
          localStorage.setItem("sentEmails", JSON.stringify(updatedEmails));
        }
        
        // status 필터링
        if (status) {
          return Promise.resolve(updatedEmails.filter((email) => email.status === status));
        }
        return Promise.resolve(updatedEmails);
      } catch {
        // 파싱 실패 시 빈 배열 반환
      }
    }
  }
  
  // 기본 Mock 데이터
  const mockEmails: Email[] = [];
  if (status) {
    return Promise.resolve(mockEmails.filter((email) => email.status === status));
  }
  return Promise.resolve(mockEmails);
}

// GET
export async function getEmails(status?: EmailStatus): Promise<Email[]> {
  // 개발 환경에서만 Mock Get Emails 사용
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Get Emails 사용 중 - 실제 API 호출하지 않음");
    return mockGetEmails(status);
  }

  // Production 환경에서는 실제 API 호출
  const url = status ? `/emails?status=${status}` : `/emails`;
  const response = await apiFetch<unknown>(url, { method: "GET" });

  const raw = response.data as any;

  // 백엔드 응답이 배열 또는 { data: [...] }, { items: [...] } 등일 수 있으므로 안전하게 처리
  if (Array.isArray(raw)) {
    return raw as Email[];
  }
  if (raw && Array.isArray(raw.data)) {
    return raw.data as Email[];
  }
  if (raw && Array.isArray(raw.items)) {
    return raw.items as Email[];
  }
  if (raw && Array.isArray(raw.results)) {
    return raw.results as Email[];
  }

  // 그 외의 경우에는 빈 배열 반환 (런타임 오류 방지)
  return [];
}

/**
 * 개발 환경용 Mock Preview Email
 * CORS 문제로 인한 로컬 개발 환경에서만 사용
 */
function mockPreviewEmail(villagerId: number, originalText: string): Promise<{ previewContent: string }> {
  // 간단한 말투 변환 시뮬레이션
  const mockPreview = originalText
    ? `${originalText} (${villagerId}번 주민 말투로 변환됨)`
    : "안녕하세요! 편지를 작성해주세요~";
  
  return Promise.resolve({
    previewContent: mockPreview,
  });
}

/**
 * 개발 환경용 Mock Send Email
 * CORS 문제로 인한 로컬 개발 환경에서만 사용
 */
function mockSendEmail(payload: SendEmailRequest): Promise<SendEmailResponse> {
  // 가짜 변환된 텍스트 생성
  const transformedText = payload.originalText
    .replace(/\./g, "~")
    .replace(/!/g, "!")
    .replace(/\?/g, "?");
  
  // localStorage에 이메일 이력 저장 (Mock 환경)
  if (typeof window !== "undefined") {
    const storedEmails = localStorage.getItem("sentEmails");
    const emails: Email[] = storedEmails ? JSON.parse(storedEmails) : [];
    
    // 주민 이름 가져오기 (Mock 데이터에서)
    const mockVillagers: { [key: number]: string } = {
      1: "톰",
      2: "이사벨",
      3: "마샬",
      4: "레이몬드",
      5: "쥬디",
      6: "셰리",
    };
    
    const newEmail: Email = {
      id: `email-${Date.now()}`,
      villagerId: payload.villagerId,
      villagerName: mockVillagers[payload.villagerId] || `주민 ${payload.villagerId}`,
      subject: "", // 현재 DTO/DB에는 제목 필드가 없으므로 빈 값 사용
      content: payload.originalText, // 유저가 작성한 원본 내용 저장
      previewContent: transformedText, // 주민 말투로 변환된 내용
      status: payload.scheduledAt ? "draft" : "sent",
      createdAt: new Date().toISOString(),
      sentAt: payload.scheduledAt ? undefined : new Date().toISOString(),
      scheduledAt: payload.scheduledAt, // 예약 시간 저장
    };
    
    emails.unshift(newEmail);
    localStorage.setItem("sentEmails", JSON.stringify(emails));
  }
  
  return Promise.resolve({
    transformedText,
    imageUrl: undefined, // Mock에서는 이미지 URL 생성하지 않음
  });
}

// POST
export async function sendEmail(payload: SendEmailRequest): Promise<SendEmailResponse> {
  // 디버깅: 전송 payload 확인
  console.log("[Emails] sendEmail - payload:", JSON.stringify(payload, null, 2));
  console.log("[Emails] sendEmail - payload 타입 확인:", {
    villagerId: typeof payload.villagerId,
    receiverEmail: typeof payload.receiverEmail,
    originalText: typeof payload.originalText,
    toneType: typeof payload.toneType,
    scheduledAt: typeof payload.scheduledAt,
  });
  
  // 필수 필드 검증
  if (typeof payload.villagerId !== "number" || !Number.isInteger(payload.villagerId)) {
    const error = new Error(`villagerId가 유효하지 않습니다: ${payload.villagerId}`);
    console.error("[Emails] sendEmail - villagerId 검증 실패:", payload);
    throw error;
  }
  
  // receiverEmail 검증
  if (!payload.receiverEmail || typeof payload.receiverEmail !== "string" || !payload.receiverEmail.trim()) {
    const error = new Error(`receiverEmail이 유효하지 않습니다: ${payload.receiverEmail}`);
    console.error("[Emails] sendEmail - receiverEmail 검증 실패:", payload);
    throw error;
  }
  
  const trimmedEmail = payload.receiverEmail.trim();
  
  // 이메일 형식 검증
  if (!isValidEmail(trimmedEmail)) {
    const error = new Error("receiverEmail이 유효한 이메일 형식이 아닙니다.");
    console.error("[Emails] sendEmail - receiverEmail 형식 오류:", trimmedEmail);
    throw error;
  }
  
  // 이메일 길이 검증 (255자 이하)
  if (trimmedEmail.length > 255) {
    const error = new Error("receiverEmail은 255자 이하여야 합니다.");
    console.error("[Emails] sendEmail - receiverEmail 길이 초과:", trimmedEmail.length);
    throw error;
  }
  
  // originalText 검증
  if (!payload.originalText || typeof payload.originalText !== "string" || !payload.originalText.trim()) {
    const error = new Error(`originalText가 유효하지 않습니다: ${payload.originalText}`);
    console.error("[Emails] sendEmail - originalText 검증 실패:", payload);
    throw error;
  }
  
  // subject 검증 (백엔드에서 필수)
  if (!payload.subject || typeof payload.subject !== "string") {
    const error = new Error("subject가 필수입니다.");
    console.error("[Emails] sendEmail - subject 누락:", payload);
    throw error;
  }
  
  const trimmedSubject = payload.subject.trim();
  
  // subject가 비어있으면 기본값 사용
  const finalSubject = trimmedSubject || "제목 없음";
  
  // subject 길이 검증 (255자 이하)
  if (finalSubject.length > 255) {
    const error = new Error("subject는 255자 이하여야 합니다.");
    console.error("[Emails] sendEmail - subject 길이 초과:", finalSubject.length);
    throw error;
  }
  
  // toneType 검증
  if (!payload.toneType || typeof payload.toneType !== "string" || !payload.toneType.trim()) {
    const error = new Error(`toneType이 유효하지 않습니다: ${payload.toneType}`);
    console.error("[Emails] sendEmail - toneType 검증 실패:", payload);
    throw error;
  }
  
  // scheduledAt 검증 (ISO 8601 형식)
  if (!payload.scheduledAt || typeof payload.scheduledAt !== "string" || !payload.scheduledAt.trim()) {
    const error = new Error(`scheduledAt이 유효하지 않습니다: ${payload.scheduledAt}`);
    console.error("[Emails] sendEmail - scheduledAt 검증 실패:", payload);
    throw error;
  }
  
  // ISO 8601 형식 검증 (간단한 체크)
  try {
    const scheduledDate = new Date(payload.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new Error("유효하지 않은 날짜 형식");
    }
  } catch (err) {
    const error = new Error(`scheduledAt이 유효한 ISO 8601 형식이 아닙니다: ${payload.scheduledAt}`);
    console.error("[Emails] sendEmail - scheduledAt 형식 검증 실패:", payload);
    throw error;
  }
  
  // 최종 payload 구성 (검증된 값 사용)
  const validatedPayload = {
    ...payload,
    receiverEmail: trimmedEmail,
    subject: finalSubject,
  };
  
  // 개발 환경에서만 Mock Send Email 사용
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Send Email 사용 중 - 실제 API 호출하지 않음");
    return mockSendEmail(payload);
  }
  
  // Production 환경에서는 실제 API 호출
  console.log(`[Emails] sendEmail - 실제 API 호출: POST /emails`);
  console.log(`[Emails] sendEmail - 요청 URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/emails`);
  console.log(`[Emails] sendEmail - 요청 body (stringified):`, JSON.stringify(validatedPayload));
  
  try {
    const response = await apiFetch<SendEmailResponse>("/emails", {
      method: "POST",
      body: JSON.stringify(validatedPayload),
    });
    console.log("[Emails] sendEmail - 응답 성공:", response.data);
    return response.data;
  } catch (err) {
    console.error("[Emails] sendEmail - 에러 발생:", err);
    if (err instanceof Error) {
      console.error("[Emails] sendEmail - 에러 상세:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
    }
    throw err;
  }
}

export async function previewEmail(
  villagerId: number,
  originalText: string,
  toneType: string
): Promise<{ previewContent: string }> {
  // toneType 검증
  if (!toneType || !toneType.trim()) {
    const error = new Error("toneType이 필수입니다. villager 데이터를 확인해주세요.");
    console.error("[Emails] previewEmail - toneType 누락:", { villagerId, originalText, toneType });
    throw error;
  }
  
  const payload = {
    villagerId,
    originalText,
    toneType,
  };
  
  console.log("[Emails] previewEmail - payload:", JSON.stringify(payload, null, 2));
  
  // 개발 환경에서만 Mock Preview Email 사용
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Preview Email 사용 중 - 실제 API 호출하지 않음");
    return mockPreviewEmail(villagerId, originalText);
  }

  // Production 환경에서는 실제 API 호출
  console.log(`[Emails] previewEmail - 실제 API 호출: POST /emails/preview`);
  const response = await apiFetch<{ previewContent: string }>("/emails/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log("[Emails] previewEmail - 응답:", response.data);
  return response.data;
}

/**
 * Preview Email Card Request/Response Types
 */
export type PreviewEmailCardRequest = {
  villagerId: number;
  originalText: string;
};

export type PreviewEmailCardResponse = {
  previewText: string;
  previewImageUrl: string;
};

/**
 * 개발 환경용 Mock Preview Email Card
 * CORS 문제로 인한 로컬 개발 환경에서만 사용
 */
function mockPreviewEmailCard(
  villagerId: number,
  originalText: string
): Promise<PreviewEmailCardResponse> {
  // 간단한 말투 변환 시뮬레이션
  const mockPreviewText = originalText
    ? `${originalText} (${villagerId}번 주민 말투로 변환됨)`
    : "안녕하세요! 편지를 작성해주세요~";
  
  // Mock 이미지 URL (실제로는 백엔드에서 sharp로 합성한 이미지 URL 반환)
  const mockImageUrl = `https://via.placeholder.com/400x520/4A90E2/FFFFFF?text=Preview+Card+${villagerId}`;
  
  return Promise.resolve({
    previewText: mockPreviewText,
    previewImageUrl: mockImageUrl,
  });
}

/**
 * 이메일 형식 검증 유틸리티
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /emails/preview - 이메일 미리보기 카드 생성
 * 백엔드에서 sharp로 주민 이미지 + 텍스트를 합성한 previewImageUrl과 previewText 반환
 */
export async function previewEmailCard(
  villagerId: number,
  originalText: string,
  toneType: string,
  receiverEmail: string // Preview API에서도 receiverEmail 필수
): Promise<PreviewEmailCardResponse> {
  // toneType 검증
  if (!toneType || !toneType.trim()) {
    const error = new Error("toneType이 필수입니다. villager 데이터를 확인해주세요.");
    console.error("[Emails] previewEmailCard - toneType 누락:", { villagerId, originalText, toneType });
    throw error;
  }
  
  // receiverEmail 검증
  if (!receiverEmail || typeof receiverEmail !== "string" || !receiverEmail.trim()) {
    const error = new Error("receiverEmail이 필수입니다.");
    console.error("[Emails] previewEmailCard - receiverEmail 누락:", { villagerId, receiverEmail });
    throw error;
  }
  
  const trimmedEmail = receiverEmail.trim();
  
  // 이메일 형식 검증
  if (!isValidEmail(trimmedEmail)) {
    const error = new Error("receiverEmail이 유효한 이메일 형식이 아닙니다.");
    console.error("[Emails] previewEmailCard - receiverEmail 형식 오류:", trimmedEmail);
    throw error;
  }
  
  // 이메일 길이 검증 (255자 이하)
  if (trimmedEmail.length > 255) {
    const error = new Error("receiverEmail은 255자 이하여야 합니다.");
    console.error("[Emails] previewEmailCard - receiverEmail 길이 초과:", trimmedEmail.length);
    throw error;
  }
  
  const payload = {
    villagerId,
    originalText,
    toneType,
    receiverEmail: trimmedEmail,
  };
  
  console.log("[Emails] previewEmailCard - payload:", JSON.stringify(payload, null, 2));
  
  // 개발 환경에서만 Mock Preview Email Card 사용
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Preview Email Card 사용 중 - 실제 API 호출하지 않음");
    return mockPreviewEmailCard(villagerId, originalText);
  }

  // Production 환경에서는 실제 API 호출
  console.log(`[Emails] previewEmailCard - 실제 API 호출: POST /emails/preview`);
  const response = await apiFetch<PreviewEmailCardResponse>("/emails/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log("[Emails] previewEmailCard - 응답:", response.data);
  return response.data;
}
