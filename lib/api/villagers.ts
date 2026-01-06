import { apiFetch } from "@/lib/api/client";

export const BASE_URL = "https://leaf-post-back.onrender.com/api";

export type Villager = {
  id: number;
  name: string;
  species: string;
  personality: string;
  birthday: string;
  catchphrase: string;
  hobby: string;
  imageUrl: string;
  iconUrl: string;
};

export async function getVillagers(): Promise<Villager[]> {
  const response = await apiFetch<unknown>("/villagers", {
    method: "GET",
  });

  const raw = response.data as any;

  // 백엔드 응답이 배열 또는 { data: [...] } 형태 모두 대응
  if (Array.isArray(raw)) {
    return raw as Villager[];
  }
  if (raw && Array.isArray(raw.data)) {
    return raw.data as Villager[];
  }

  // 그 외의 경우에는 빈 배열 반환 (런타임 오류 방지)
  return [];
}

export async function getVillagerById(id: number): Promise<Villager> {
  const response = await apiFetch<unknown>(`/villagers/${id}`, {
    method: "GET",
  });

  const raw = response.data as any;

  // 단일 객체 또는 { data: { ... } } 형태 모두 대응
  if (raw && !Array.isArray(raw) && typeof raw === "object") {
    if (raw.data && typeof raw.data === "object") {
      return raw.data as Villager;
    }
    return raw as Villager;
  }

  throw new Error("잘못된 주민 상세 응답 형식입니다.");
}

