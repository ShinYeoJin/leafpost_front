import { apiFetch } from "./client";

export type EmailStatus = "draft" | "sent" | "deleted";
export type Email = { 
  id: string; 
  villagerId: number; 
  villagerName?: string; // optional (백엔드 응답에 없을 수 있음)
  subject: string; 
  originalText: string; // 사용자가 입력한 원본 텍스트
  transformedText?: string; // 주민 버전으로 변환된 텍스트 (실제 전송된 내용)
  content?: string; // 하위 호환성을 위해 유지 (deprecated)
  previewContent?: string; // 하위 호환성을 위해 유지 (deprecated)
  status?: EmailStatus; // optional (백엔드 응답에 없을 수 있음)
  createdAt: string; 
  sentAt?: string; 
  deletedAt?: string; 
  scheduledAt?: string; 
};

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
        // 하위 호환성: 기존 localStorage 데이터에 originalText/transformedText가 없을 수 있음
        const updatedEmails = emails.map((email) => {
          // originalText와 transformedText 필드 보완 (하위 호환성)
          const originalText = email.originalText || email.content || "";
          const transformedText = email.transformedText || email.previewContent || "";
          
          const baseEmail = {
            ...email,
            originalText,
            transformedText,
            // 하위 호환성을 위해 유지
            content: originalText,
            previewContent: transformedText,
          };
          
          if (email.status === "draft" && email.scheduledAt) {
            const scheduledTime = new Date(email.scheduledAt);
            if (scheduledTime <= now) {
              updated = true;
              return {
                ...baseEmail,
                status: "sent" as EmailStatus,
                sentAt: email.sentAt || scheduledTime.toISOString(),
              };
            }
          }
          return baseEmail;
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
  
  console.log("[Emails] getEmails - 전체 응답:", JSON.stringify(raw, null, 2));

  // 백엔드 응답 구조 처리: { success: true, data: { data: [...] } }
  let emailsArray: any[] = [];
  
  if (Array.isArray(raw)) {
    emailsArray = raw;
  } else if (raw && raw.data) {
    // { data: [...] } 또는 { data: { data: [...] } }
    if (Array.isArray(raw.data)) {
      emailsArray = raw.data;
    } else if (raw.data && Array.isArray(raw.data.data)) {
      // 중첩된 구조: { data: { data: [...] } }
      emailsArray = raw.data.data;
    }
  } else if (raw && Array.isArray(raw.items)) {
    emailsArray = raw.items;
  } else if (raw && Array.isArray(raw.results)) {
    emailsArray = raw.results;
  }

  // Email 타입으로 변환 (백엔드 필드명 그대로 사용)
  const emails: Email[] = emailsArray.map((item: any) => {
    // 하위 호환성: content 필드가 있으면 originalText로 매핑
    const originalText = item.originalText || item.content || "";
    const transformedText = item.transformedText || item.previewContent || "";
    
    return {
      id: item.id || "",
      villagerId: item.villagerId || 0,
      villagerName: item.villagerName, // 백엔드에서 제공하지 않을 수 있음
      subject: item.subject || "",
      originalText,
      transformedText,
      // 하위 호환성을 위해 유지
      content: originalText,
      previewContent: transformedText,
      status: item.status || "sent", // 기본값: sent
      createdAt: item.createdAt || "",
      sentAt: item.sentAt,
      deletedAt: item.deletedAt,
      scheduledAt: item.scheduledAt,
    };
  });

  console.log("[Emails] getEmails - 변환된 이메일 목록:", emails);
  return emails;
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
      subject: payload.subject || "", // subject 필드 추가
      originalText: payload.originalText, // 유저가 작성한 원본 내용 (필수)
      transformedText: transformedText, // 주민 말투로 변환된 내용 (실제 전송된 내용)
      // 하위 호환성을 위해 유지
      content: payload.originalText,
      previewContent: transformedText,
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
  
  // subject 검증 (백엔드에서 optional이므로 타입과 길이만 검증)
  if (payload.subject !== undefined && typeof payload.subject !== "string") {
    const error = new Error("subject는 string 타입이어야 합니다.");
    console.error("[Emails] sendEmail - subject 타입 오류:", payload);
    throw error;
  }
  
  const trimmedSubject = payload.subject ? payload.subject.trim() : "";
  
  // subject 길이 검증 (255자 이하, 비어있어도 OK)
  if (trimmedSubject.length > 255) {
    const error = new Error("subject는 255자 이하여야 합니다.");
    console.error("[Emails] sendEmail - subject 길이 초과:", trimmedSubject.length);
    throw error;
  }
  
  const finalSubject = trimmedSubject; // 빈 문자열도 허용
  
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
  // ⚠️ 주의: 현재 백엔드 Preview DTO는 receiverEmail을 요구합니다.
  // 이 함수는 구 버전 호환용이며, MailCardForm에서는 previewEmailCard를 사용합니다.
  // 잘못된 payload로 백엔드에 500을 유발하지 않도록, Production에서는
  // API를 호출하지 않고 클라이언트에서 단순 미리보기만 제공합니다.

  const trimmedText = (originalText || "").trim();

  // 내용이 없으면 미리보기도 비움
  if (!trimmedText) {
    console.log("[Emails] previewEmail - originalText가 비어 있어 미리보기를 생성하지 않습니다.", {
      villagerId,
      toneType,
    });
    return { previewContent: "" };
  }

  // toneType 검증
  if (!toneType || !toneType.trim()) {
    const error = new Error(
      "toneType이 필수입니다. villager 데이터를 확인해주세요."
    );
    console.error("[Emails] previewEmail - toneType 누락:", {
      villagerId,
      originalText,
      toneType,
    });
    // ✅ 서버에 잘못된 요청을 보내지 않고, 단순 텍스트 미리보기만 반환
    return { previewContent: trimmedText };
  }

  const payload = {
    villagerId,
    originalText: trimmedText,
    toneType: toneType.trim(),
  };

  console.log("[Emails] previewEmail - payload (클라이언트 전용 미리보기):", payload);

  // 개발 환경에서는 기존 Mock 동작 유지
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Preview Email 사용 중 - 실제 API 호출하지 않음");
    return mockPreviewEmail(villagerId, trimmedText);
  }

  // ✅ Production에서는 서버 API를 호출하지 않고, 입력 텍스트를 그대로 미리보기로 사용
  //    (서버 DTO 변경으로 인한 500 방지)
  return { previewContent: trimmedText };
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
  const trimmedText = (originalText || "").trim();

  if (!trimmedText) {
    const error = new Error("originalText가 비어 있어 미리보기를 생성할 수 없습니다.");
    console.error("[Emails] previewEmailCard - originalText 누락:", {
      villagerId,
      originalText,
      toneType,
      receiverEmail,
    });
    throw error;
  }

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
    originalText: trimmedText,
    toneType: toneType.trim(),
    receiverEmail: trimmedEmail,
  };
  
  console.log("[Emails] previewEmailCard - payload:", JSON.stringify(payload, null, 2));
  
  // 개발 환경에서만 Mock Preview Email Card 사용
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Preview Email Card 사용 중 - 실제 API 호출하지 않음");
    return mockPreviewEmailCard(villagerId, trimmedText);
  }

  // Production 환경에서는 실제 API 호출
  console.log(`[Emails] previewEmailCard - 실제 API 호출: POST /emails/preview`);
  try {
    const response = await apiFetch<PreviewEmailCardResponse>("/emails/preview", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("[Emails] previewEmailCard - 응답:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("[Emails] previewEmailCard - API 호출 실패:", err);

    // 500 에러 등 서버측 에러에 대해 로그를 최대한 남기고, 상위에서 UX fallback 처리
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as Error).message
        : "미리보기를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.";

    throw new Error(message);
  }
}
