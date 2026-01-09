import { apiFetch } from "@/lib/api/client";

export type PopularityRank = {
  villagerId: number;
  villagerName: string;
  rank: number; // 1, 2, 3 등
  count: number; // 선택 횟수
};

export type PopularityResponse = {
  rankings: PopularityRank[];
  success: boolean;
};

/**
 * 주민 카드 인기 순위 조회
 * 백엔드 라우트: GET /api/cards/popularity
 */
export async function getPopularityRankings(): Promise<PopularityResponse> {
  try {
    console.log("[Cards] getPopularityRankings - 인기 순위 조회 시작");
    const response = await apiFetch<any>("/cards/popularity", {
      method: "GET",
    });
    
    console.log("[Cards] getPopularityRankings - ✅ 인기 순위 조회 성공:", {
      status: response.status,
      rawData: response.data,
    });
    
    // ✅ 백엔드 인터셉터가 { data: {...} } 형태로 래핑하는 경우 처리
    let popularityData: PopularityResponse;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // 인터셉터 래핑된 경우: { data: { rankings: [...], ... } }
      console.log("[Cards] getPopularityRankings - 인터셉터 래핑된 응답 감지");
      popularityData = response.data.data;
    } else {
      // 직접 응답: { rankings: [...], ... }
      console.log("[Cards] getPopularityRankings - 직접 응답");
      popularityData = response.data;
    }
    
    // ✅ rankings 배열 검증
    if (!popularityData.rankings || !Array.isArray(popularityData.rankings)) {
      console.warn("[Cards] getPopularityRankings - rankings가 배열이 아님, 빈 배열로 처리");
      popularityData.rankings = [];
    }
    
    console.log("[Cards] getPopularityRankings - 파싱된 인기 순위:", {
      rankingsCount: popularityData.rankings.length,
      top3: popularityData.rankings.slice(0, 3).map(r => ({
        villagerId: r.villagerId,
        villagerName: r.villagerName,
        rank: r.rank,
        count: r.count,
      })),
    });
    
    return popularityData;
  } catch (error) {
    console.error("[Cards] getPopularityRankings - ❌ 인기 순위 조회 실패:", error);
    // 에러 발생 시 빈 순위 반환
    return {
      rankings: [],
      success: false,
    };
  }
}
