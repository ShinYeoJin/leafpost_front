import { apiFetch } from "@/lib/api/client";

export const BASE_URL = "https://leaf-post-back.onrender.com/api";

// 백엔드 응답 타입 (예시)
export interface VillagerApi {
  id: number;
  name: string;
  imageUrl: string;
  previewText: string;
  toneType?: string;
}

// 프론트에서 사용하는 Villager 타입
export type Villager = {
  id: number;
  name: string;
  imageUrl: string;
  iconUrl: string;
  toneExample: string;
  toneType: string;
};

export type GetVillagersResponse = {
  villagers: Villager[];
  isValid: boolean;
};

/**
 * 백엔드 응답을 프론트에서 사용하는 Villager 타입으로 변환
 */
function normalizeVillager(item: any): Villager | null {
  // 디버깅: 실제 응답 구조 확인
  console.log("[Villagers] normalizeVillager - 원본 응답:", JSON.stringify(item, null, 2));

  const api = item as VillagerApi;

  if (!api || typeof api.id !== "number" || typeof api.name !== "string") {
    console.warn("[Villagers] normalizeVillager - 필수 필드 누락:", { id: api?.id, name: api?.name });
    return null;
  }

  const imageUrl = api.imageUrl;
  if (!imageUrl || typeof imageUrl !== "string") {
    console.warn("[Villagers] normalizeVillager - imageUrl 누락:", api);
    return null;
  }

  const toneExample = api.previewText ?? "";
  
  // toneType 추출: 다양한 응답 구조 대응
  let toneType: string | undefined;
  
  // 케이스 1: 직접 필드 (api.toneType)
  if (typeof api.toneType === "string" && api.toneType.trim()) {
    toneType = api.toneType;
  }
  // 케이스 2: tones 배열의 첫 번째 항목 (api.tones[0].toneType)
  else if (Array.isArray((item as any).tones) && (item as any).tones.length > 0) {
    const firstTone = (item as any).tones[0];
    if (typeof firstTone?.toneType === "string" && firstTone.toneType.trim()) {
      toneType = firstTone.toneType;
    }
  }
  // 케이스 3: tone 객체 (api.tone.toneType)
  else if ((item as any).tone && typeof (item as any).tone.toneType === "string") {
    toneType = (item as any).tone.toneType;
  }

  // toneType이 없으면 경고 및 기본값 사용 (개발 환경에서만)
  if (!toneType) {
    console.warn(
      `[Villagers] normalizeVillager - toneType을 찾을 수 없음 (villagerId: ${api.id}). ` +
      `응답 구조: ${JSON.stringify(item, null, 2)}. 기본값 "RULE" 사용.`
    );
    toneType = "RULE"; // 개발 환경 기본값
  }

  const normalized = {
    id: api.id,
    name: api.name,
    imageUrl,
    // 아이콘이 별도로 없다면 imageUrl을 재사용
    iconUrl: imageUrl,
    toneExample,
    toneType,
  };

  console.log(`[Villagers] normalizeVillager - 정규화 완료 (villagerId: ${api.id}, toneType: ${toneType}):`, normalized);
  
  return normalized;
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
    toneType: "RULE",
  },
  {
    id: 2,
    name: "이사벨",
    toneExample: "날씨가 정말 좋네요! 산책하기 좋은 날이에요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/2",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/2",
    toneType: "RULE",
  },
  {
    id: 3,
    name: "마샬",
    toneExample: "오늘 뭐 하실 거예요? 함께 놀아요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/3",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/3",
    toneType: "RULE",
  },
  {
    id: 4,
    name: "레이몬드",
    toneExample: "편지 받아서 정말 기뻐요! 고마워요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/4",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/4",
    toneType: "RULE",
  },
  {
    id: 5,
    name: "쥬디",
    toneExample: "오늘도 힘내세요! 응원할게요~",
    imageUrl: "https://acnhapi.com/v1/images/villagers/5",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/5",
    toneType: "RULE",
  },
  {
    id: 6,
    name: "셰리",
    toneExample: "안녕하세요! 오늘도 즐거운 하루 되세요!",
    imageUrl: "https://acnhapi.com/v1/images/villagers/6",
    iconUrl: "https://acnhapi.com/v1/icons/villagers/6",
    toneType: "RULE",
  },
];

export async function getVillagers(): Promise<GetVillagersResponse> {
  try {
    const response = await apiFetch<unknown>("/villagers", {
      method: "GET",
    });

    const raw = response.data as any;
    
    // 디버깅: 전체 응답 구조 확인
    console.log("[Villagers] getVillagers - 전체 응답:", JSON.stringify(raw, null, 2));

    // 케이스 1: 응답이 직접 배열인 경우
    if (Array.isArray(raw)) {
      const validatedVillagers = normalizeVillagersArray(raw);
      return {
        villagers: validatedVillagers,
        isValid: validatedVillagers.length > 0,
      };
    }

    // 케이스 2: { data: [...] } 형태인 경우
    if (raw && typeof raw === "object" && raw.data) {
      if (Array.isArray(raw.data)) {
        const validatedVillagers = normalizeVillagersArray(raw.data);
        return {
          villagers: validatedVillagers,
          isValid: validatedVillagers.length > 0,
        };
      }

      // data가 문자열 등 예상과 다른 경우
      console.warn("[Villagers] 예상치 못한 data 형식:", raw.data);
      return {
        villagers: [],
        isValid: false,
      };
    }

    // 케이스 3: 예상치 못한 최상위 형식
    console.warn("[Villagers] 예상치 못한 응답 형식:", raw);
    return {
      villagers: [],
      isValid: false,
    };
  } catch (error) {
    console.error("[Villagers] API 호출 실패, mock 데이터로 대체합니다.", error);
    // 백엔드 장애 시에도 화면은 동작하도록 mock 데이터 사용
    return {
      villagers: mockVillagers,
      isValid: true,
    };
  }
}

export async function getVillagerById(id: number): Promise<Villager> {
  const response = await apiFetch<unknown>(`/villagers/${id}`, {
    method: "GET",
  });

  const raw = response.data as any;
  
  // 디버깅: 단일 villager 응답 구조 확인
  console.log(`[Villagers] getVillagerById(${id}) - 전체 응답:`, JSON.stringify(raw, null, 2));

  // 단일 객체 또는 { data: { ... } } 형태 모두 대응
  if (raw && !Array.isArray(raw) && typeof raw === "object") {
    const data = raw.data && typeof raw.data === "object" ? raw.data : raw;
    const villager = normalizeVillager(data);
    if (villager) {
      console.log(`[Villagers] getVillagerById(${id}) - 정규화 완료, toneType: ${villager.toneType}`);
      return villager;
    }
  }

  throw new Error("잘못된 주민 상세 응답 형식입니다.");
}

