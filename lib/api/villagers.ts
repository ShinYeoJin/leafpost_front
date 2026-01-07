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

export type GetVillagersResponse = {
  villagers: Villager[];
  isValid: boolean;
};

/**
 * Villager 객체가 유효한지 검증하는 헬퍼 함수
 * 백엔드에서 실제 배열이 내려올 때 타입 안정성을 보장
 */
function isValidVillager(item: any): item is Villager {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.imageUrl === "string"
  );
}

/**
 * 배열 내부의 각 항목이 유효한 Villager인지 검증
 */
function validateVillagersArray(arr: any[]): Villager[] {
  return arr.filter(isValidVillager);
}

export async function getVillagers(): Promise<GetVillagersResponse> {
  const response = await apiFetch<unknown>("/villagers", {
    method: "GET",
  });

  const raw = response.data as any;

  // 케이스 1: 응답이 직접 배열인 경우
  if (Array.isArray(raw)) {
    const validatedVillagers = validateVillagersArray(raw);
    return {
      villagers: validatedVillagers,
      isValid: true,
    };
  }

  // 케이스 2: { data: [...] } 형태인 경우
  if (raw && typeof raw === "object" && raw.data) {
    // data가 배열인지 확인
    if (Array.isArray(raw.data)) {
      const validatedVillagers = validateVillagersArray(raw.data);
      return {
        villagers: validatedVillagers,
        isValid: true,
      };
    }
    // data가 문자열이거나 다른 형태인 경우 (현재 더미 응답)
    // 예: { "success": true, "data": "This action returns all villagers" }
    return {
      villagers: [],
      isValid: false,
    };
  }

  // 케이스 3: 예상치 못한 형태
  return {
    villagers: [],
    isValid: false,
  };
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

