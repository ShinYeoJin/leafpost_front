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
  const response = await apiFetch<Email[]>(url, { method: "GET" });
  return response.data;
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
