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
  usageCount?: number; // 선택 횟수 (Redis 기반)
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
  
  // toneType 추출: 백엔드 응답에서만 추출 (fallback 없음)
  let toneType: string | undefined;
  
  console.log(`[Villagers] normalizeVillager - toneType 추출 시도 (villagerId: ${api.id})`);
  console.log(`[Villagers] normalizeVillager - 가능한 toneType 필드들:`, {
    "api.toneType": api.toneType,
    "item.toneType": (item as any).toneType,
    "item.tone_type": (item as any).tone_type,
    "item.tone": (item as any).tone,
    "item.tones": (item as any).tones,
    "item.tones?.[0]": Array.isArray((item as any).tones) ? (item as any).tones[0] : undefined,
  });
  
  // 케이스 1: 직접 필드 (api.toneType)
  if (typeof api.toneType === "string" && api.toneType.trim()) {
    toneType = api.toneType;
    console.log(`[Villagers] normalizeVillager - 케이스 1: api.toneType = "${toneType}"`);
  }
  // 케이스 1-2: snake_case (item.tone_type)
  else if (typeof (item as any).tone_type === "string" && (item as any).tone_type.trim()) {
    toneType = (item as any).tone_type;
    console.log(`[Villagers] normalizeVillager - 케이스 1-2: item.tone_type = "${toneType}"`);
  }
  // 케이스 2: tones 배열의 첫 번째 항목 (item.tones[0].toneType) - 가장 일반적인 케이스
  else if (Array.isArray((item as any).tones) && (item as any).tones.length > 0) {
    const firstTone = (item as any).tones[0];
    if (typeof firstTone?.toneType === "string" && firstTone.toneType.trim()) {
      toneType = firstTone.toneType;
      console.log(`[Villagers] normalizeVillager - 케이스 2: item.tones[0].toneType = "${toneType}"`);
    } else if (typeof firstTone?.tone_type === "string" && firstTone.tone_type.trim()) {
      toneType = firstTone.tone_type;
      console.log(`[Villagers] normalizeVillager - 케이스 2-2: item.tones[0].tone_type = "${toneType}"`);
    }
  }
  // 케이스 3: tone 객체 (item.tone.toneType)
  else if ((item as any).tone && typeof (item as any).tone === "object") {
    if (typeof (item as any).tone.toneType === "string" && (item as any).tone.toneType.trim()) {
      toneType = (item as any).tone.toneType;
      console.log(`[Villagers] normalizeVillager - 케이스 3: item.tone.toneType = "${toneType}"`);
    } else if (typeof (item as any).tone.tone_type === "string" && (item as any).tone.tone_type.trim()) {
      toneType = (item as any).tone.tone_type;
      console.log(`[Villagers] normalizeVillager - 케이스 3-2: item.tone.tone_type = "${toneType}"`);
    }
  }

  // toneType이 없으면 에러 처리 (fallback 제거)
  if (!toneType) {
    console.error(
      `[Villagers] normalizeVillager - ❌ toneType을 찾을 수 없음 (villagerId: ${api.id})! ` +
      `백엔드 응답에 toneType 정보가 없습니다. 전체 응답 구조:`,
      JSON.stringify(item, null, 2)
    );
    // toneType이 없으면 null 반환하여 해당 villager를 제외
    return null;
  } else {
    console.log(`[Villagers] normalizeVillager - ✅ toneType 추출 성공: "${toneType}"`);
  }

  // ✅ usageCount 추출 (Redis 기반 인기 순위 데이터)
  // Redis 장애 시 usageCount가 없거나 0일 수 있음
  const usageCount = 
    typeof item.usageCount === "number" ? item.usageCount :
    typeof (item as any).usage_count === "number" ? (item as any).usage_count :
    typeof (item as any).count === "number" ? (item as any).count :
    undefined;
  
  // toneType이 없으면 이미 위에서 null 반환했으므로, 여기서는 항상 toneType이 존재함
  const normalized = {
    id: api.id,
    name: api.name,
    imageUrl,
    // 아이콘이 별도로 없다면 imageUrl을 재사용
    iconUrl: imageUrl,
    toneExample,
    toneType: toneType, // 백엔드에서 받은 실제 값만 사용 (fallback 없음)
    usageCount, // 선택 횟수 (Redis 장애 시 undefined 또는 0)
  };
  
  if (usageCount !== undefined) {
    console.log(`[Villagers] normalizeVillager - usageCount 추출: ${usageCount} (villagerId: ${api.id})`);
  }

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
 * ⚠️ 주의: toneType은 백엔드 villager_tones 테이블에서만 가져와야 하므로
 *          Mock 데이터는 사용하지 않습니다.
 *          실제 환경에서는 백엔드 API 응답만 사용해야 합니다.
 */
const mockVillagers: Villager[] = [
  // Mock 데이터는 toneType 정보가 없으므로 사용하지 않음
  // 백엔드 API가 항상 toneType을 포함해야 함
];

/**
 * 주민 목록 조회
 * @param sort 정렬 방식 ('popular' | undefined)
 * @param limit 최대 개수 (기본값: undefined, 최대 100)
 */
export async function getVillagers(sort?: 'popular', limit?: number): Promise<GetVillagersResponse> {
  try {
    // ✅ 쿼리 파라미터 구성
    const params = new URLSearchParams();
    if (sort === 'popular') {
      params.append('sort', 'popular');
    }
    if (limit !== undefined && limit > 0) {
      params.append('limit', Math.min(limit, 100).toString()); // 최대 100으로 제한
    }
    
    const queryString = params.toString();
    const url = queryString ? `/villagers?${queryString}` : "/villagers";
    
    console.log("[Villagers] getVillagers - API 호출:", {
      url,
      sort,
      limit,
    });
    
    const response = await apiFetch<unknown>(url, {
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
    console.error("[Villagers] API 호출 실패:", error);
    // 백엔드 장애 시 빈 배열 반환 (toneType이 없는 mock 데이터 사용 금지)
    console.warn("[Villagers] 백엔드 API 호출 실패로 빈 배열 반환. toneType 정보가 없으면 이메일 전송이 불가능합니다.");
    return {
      villagers: [],
      isValid: false,
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

