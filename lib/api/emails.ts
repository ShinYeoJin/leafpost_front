import { apiFetch } from "./client";

export type EmailStatus = "draft" | "sent" | "deleted";
export type Email = { id: string; villagerId: number; villagerName: string; subject: string; content: string; previewContent?: string; status: EmailStatus; createdAt: string; sentAt?: string; deletedAt?: string; };

export type SendEmailRequest = {
  villagerId: number;
  subject: string;
  content: string;
  scheduledAt?: string;
};

export type SendEmailResponse = {
  transformedText?: string;
  imageUrl?: string;
  [key: string]: unknown;
};

// GET
export async function getEmails(status?: EmailStatus): Promise<Email[]> {
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

// POST
export async function sendEmail(payload: SendEmailRequest): Promise<SendEmailResponse> {
  const response = await apiFetch<SendEmailResponse>("/emails", { method: "POST", body: JSON.stringify(payload) });
  return response.data;
}

export async function previewEmail(villagerId: number, originalText: string): Promise<{ previewContent: string }> {
  const response = await apiFetch<{ previewContent: string }>("/emails/preview", {
    method: "POST",
    body: JSON.stringify({ villagerId, content: originalText }),
  });
  return response.data;
}
