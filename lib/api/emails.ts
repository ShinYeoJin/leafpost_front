import { apiFetch } from "./client";

export type EmailStatus = "draft" | "sent" | "deleted";
export type Email = { id: string; villagerId: number; villagerName: string; subject: string; content: string; previewContent?: string; status: EmailStatus; createdAt: string; sentAt?: string; deletedAt?: string; scheduledAt?: string; };

export type SendEmailRequest = {
  villagerId: number;
  subject: string;
  content: string;
  scheduledAt?: string;
  fromEmail?: string;
  toEmail?: string;
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
  const transformedText = payload.content
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
      subject: payload.subject,
      content: payload.content, // 유저가 작성한 원본 내용 저장
      previewContent: transformedText, // 주민 말투로 변환된 내용
      status: payload.scheduledAt ? "draft" : "sent",
      createdAt: new Date().toISOString(),
      sentAt: payload.scheduledAt ? undefined : new Date().toISOString(),
      scheduledAt: payload.scheduledAt, // 예약 시간 저장
    };
    
    // Mock 환경에서는 실제 메일을 보낼 수 없지만, 
    // 프로덕션 환경에서는 백엔드 API가 payload.fromEmail과 payload.toEmail을 사용하여 실제 메일을 전송합니다.
    if (payload.fromEmail && payload.toEmail) {
      console.log(`[Mock] 이메일 전송 시뮬레이션: ${payload.fromEmail} -> ${payload.toEmail}`);
      console.log(`[Mock] 제목: ${payload.subject}`);
      console.log(`[Mock] 내용: ${payload.content}`);
    }
    
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
  // 개발 환경에서만 Mock Send Email 사용
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Send Email 사용 중 - 실제 API 호출하지 않음");
    return mockSendEmail(payload);
  }
  
  // Production 환경에서는 실제 API 호출
  const response = await apiFetch<SendEmailResponse>("/emails", { method: "POST", body: JSON.stringify(payload) });
  return response.data;
}

export async function previewEmail(villagerId: number, originalText: string): Promise<{ previewContent: string }> {
  // 개발 환경에서만 Mock Preview Email 사용
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Preview Email 사용 중 - 실제 API 호출하지 않음");
    return mockPreviewEmail(villagerId, originalText);
  }
  
  // Production 환경에서는 실제 API 호출
  const response = await apiFetch<{ previewContent: string }>("/emails/preview", {
    method: "POST",
    body: JSON.stringify({ villagerId, content: originalText }),
  });
  return response.data;
}
