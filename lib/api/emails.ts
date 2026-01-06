import { apiFetch } from "./client";

export type EmailStatus = "draft" | "sent" | "deleted";
export type Email = { id: string; villagerId: number; villagerName: string; subject: string; content: string; previewContent?: string; status: EmailStatus; createdAt: string; sentAt?: string; deletedAt?: string; };

// GET
export async function getEmails(status?: EmailStatus): Promise<Email[]> {
  const url = status ? `/emails?status=${status}` : `/emails`;
  const response = await apiFetch<Email[]>(url, { method: "GET" });
  return response.data;
}

// POST
export async function sendEmail(payload: { villagerId: number; subject: string; content: string; }) {
  const response = await apiFetch("/emails", { method: "POST", body: JSON.stringify(payload) });
  return response.data;
}
