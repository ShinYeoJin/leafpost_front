import { apiFetch } from "@/lib/api/client";

export const BASE_URL = "https://leaf-post-back.onrender.com/api";

// 백엔드 응답 타입 (예시)
export interface VillagerApi {
  id: number;
  name: string;
  imageUrl: string;
  previewText: string;
}

// 프론트에서 사용하는 Villager 타입
export type Villager = {
  id: number;
  name: string;
  imageUrl: string;
  iconUrl: string;
  toneExample: string;
};

export type GetVillagersResponse = {
  villagers: Villager[];
  isValid: boolean;
};

/**
 * 백엔드 응답을 프론트에서 사용하는 Villager 타입으로 변환
 */
function normalizeVillager(item: any): Villager | null {
  const api = item as VillagerApi;

  if (!api || typeof api.id !== "number" || typeof api.name !== "string") {
    return null;
  }

  const imageUrl = api.imageUrl;
  if (!imageUrl || typeof imageUrl !== "string") return null;

  const toneExample = api.previewText ?? "";

  return {
    id: api.id,
    name: api.name,
    imageUrl,
    // 아이콘이 별도로 없다면 imageUrl을 재사용
    iconUrl: imageUrl,
    toneExample,
  };
}

/**
 * 배열 내부의 각 항목을 Villager로 변환
 */
function normalizeVillagersArray(arr: any[]): Villager[] {
  return arr
    .map((item) => normalizeVillager(item))
    .filter((v): v is Villager => v !== null);
}

/**
 * 개발 환경용 Mock Villager 데이터
 * CORS 문제로 인한 로컬 개발 환경에서 UI 테스트를 위해 사용
 * toneExample은 hover 시 말투 예시로 사용됨
 */
const mockVillagers: Villager[] = [
  {
    id: 1,
    name: "톰",
    toneExample: "안녕하세요! 오늘도 좋은 하루 되세요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/1",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/1",
  },
  {
    id: 2,
    name: "이사벨",
    toneExample: "날씨가 정말 좋네요! 산책하기 좋은 날이에요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/2",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/2",
  },
  {
    id: 3,
    name: "마샬",
    toneExample: "오늘 뭐 하실 거예요? 함께 놀아요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/3",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/3",
  },
  {
    id: 4,
    name: "레이몬드",
    toneExample: "편지 받아서 정말 기뻐요! 고마워요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/4",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/4",
  },
  {
    id: 5,
    name: "쥬디",
    toneExample: "오늘도 힘내세요! 응원할게요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/5",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/5",
  },
  {
    id: 6,
    name: "셰리",
    toneExample: "안녕하세요! 오늘도 즐거운 하루 되세요!",
    imageUrl: "https://acnhapi.com/v1/images/villagers/6",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/6",
  },
];

export async function getVillagers(): Promise<GetVillagersResponse> {
  // 개발 환경에서만 Mock 데이터 사용 (CORS 문제 해결)
  if ((process.env.NODE_ENV as string) === "development") {
    console.log("[DEV] Mock Villagers 사용 중 - 실제 API 호출하지 않음");
    return {
      villagers: mockVillagers,
      isValid: true,
    };
  }

  // Production 환경에서는 실제 API 호출
  const response = await apiFetch<unknown>("/villagers", {
    method: "GET",
  });

  const raw = response.data as any;

  // 케이스 1: 응답이 직접 배열인 경우
  if (Array.isArray(raw)) {
    const validatedVillagers = normalizeVillagersArray(raw);
    return {
      villagers: validatedVillagers,
      isValid: true,
    };
  }

  // 케이스 2: { data: [...] } 형태인 경우
  if (raw && typeof raw === "object" && raw.data) {
    // data가 배열인지 확인
    if (Array.isArray(raw.data)) {
      const validatedVillagers = normalizeVillagersArray(raw.data);
      return {
        villagers: validatedVillagers,
        isValid: true,
      };
    }
    // data가 문자열이거나 다른 형태인 경우 (현재 더미 응답)
    // 예: { "success": true, "data": "This action returns all villagers" }
    // Production 환경에서는 빈 배열 반환 (개발 환경은 이미 위에서 처리됨)
    return {
      villagers: [],
      isValid: false,
    };
  }

  // 케이스 3: 예상치 못한 형태
  // Production 환경에서는 빈 배열 반환 (개발 환경은 이미 위에서 처리됨)
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
    const data = raw.data && typeof raw.data === "object" ? raw.data : raw;
    const villager = normalizeVillager(data);
    if (villager) return villager;
  }

  throw new Error("잘못된 주민 상세 응답 형식입니다.");
}

