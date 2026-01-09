"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import VillagerCard from "@/components/villagers/VillagerCard";
import MailCardForm from "@/components/mail/MailCardForm";
import { getVillagers, type Villager as ApiVillager } from "@/lib/api/villagers";
import { getPopularityRankings, type PopularityRank } from "@/lib/api/cards";
import { checkAuth } from "@/lib/api/auth";

export default function MainPage() {
  const router = useRouter();
  const [villagers, setVillagers] = useState<ApiVillager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidResponse, setIsValidResponse] = useState<boolean>(true);
  const [selectedVillager, setSelectedVillager] = useState<ApiVillager | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [popularityRankings, setPopularityRankings] = useState<Map<number, PopularityRank>>(new Map());

  // ✅ 크로스 도메인 쿠키 문제로 middleware에서 인증 체크 불가능
  // 클라이언트에서 인증 상태 확인
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("[MainPage] 인증 상태 확인 중...");
        const authResult = await checkAuth();
        
        if (!authResult.authenticated) {
          console.log("[MainPage] ❌ 인증 실패 - /login으로 리다이렉트");
          router.push("/login");
          return;
        }
        
        console.log("[MainPage] ✅ 인증 확인 성공");
        setIsAuthChecked(true);
      } catch (err) {
        console.error("[MainPage] 인증 확인 중 에러:", err);
        router.push("/login");
      }
    };
    
    verifyAuth();
  }, [router]);

  useEffect(() => {
    // 인증 확인 전에는 데이터를 불러오지 않음
    if (!isAuthChecked) {
      return;
    }
    const fetchVillagers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // ✅ 주민 목록과 인기 순위를 병렬로 가져오기
        const [villagersResponse, popularityResponse] = await Promise.all([
          getVillagers(),
          getPopularityRankings(),
        ]);
        
        // ✅ 인기 순위를 Map으로 변환 (villagerId를 키로 사용)
        const rankingsMap = new Map<number, PopularityRank>();
        if (popularityResponse.rankings && Array.isArray(popularityResponse.rankings)) {
          popularityResponse.rankings.forEach((ranking) => {
            rankingsMap.set(ranking.villagerId, ranking);
          });
        }
        setPopularityRankings(rankingsMap);
        
        // ✅ 주민 목록에 인기 순위 정보 추가
        if (Array.isArray(villagersResponse.villagers)) {
          const villagersWithRanking = villagersResponse.villagers.map((villager) => {
            const ranking = rankingsMap.get(villager.id);
            return {
              ...villager,
              popularityRank: ranking?.rank,
              popularityCount: ranking?.count,
            };
          });
          
          setVillagers(villagersWithRanking);
          setIsValidResponse(villagersResponse.isValid);
        } else {
          // 이중 방어: 만약 villagers가 배열이 아닌 경우
          setVillagers([]);
          setIsValidResponse(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "주민 목록을 불러오는데 실패했습니다.";
        setError(errorMessage);
        setIsValidResponse(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVillagers();

    // 페이지 포커스 시 최신 데이터 로딩 (다른 기기에서 수정한 내용 반영)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 페이지가 다시 보일 때 데이터 다시 불러오기
        fetchVillagers();
      }
    };

    // 페이지 포커스 이벤트 리스너 추가
    const handleFocus = () => {
      fetchVillagers();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthChecked]); // ✅ isAuthChecked가 true일 때만 실행

  const handleVillagerClick = (villager: ApiVillager) => {
    // 디버깅: 선택된 villager의 toneType 확인
    console.log(`[MainPage] handleVillagerClick - 선택된 villager:`, {
      id: villager.id,
      name: villager.name,
      toneType: villager.toneType,
      전체데이터: villager,
    });
    
    // toneType이 없으면 선택 불가 처리
    if (!villager.toneType || !villager.toneType.trim()) {
      console.error(
        `[MainPage] handleVillagerClick - ❌ toneType 누락! villagerId: ${villager.id}. ` +
        `이 주민은 말투 정보가 없어 이메일 전송이 불가능합니다.`,
        villager
      );
      // 에러 메시지 표시 (선택사항)
      alert(`${villager.name}의 말투 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.`);
      return; // 모달을 열지 않음
    }
    
    console.log(`[MainPage] handleVillagerClick - ✅ toneType 확인됨: "${villager.toneType}"`);
    setSelectedVillager(villager);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVillager(null);
  };

  const handleSendNow = () => {
    // 이메일 전송 완료 후 모달 닫기 (MailCard 내부에서 처리됨)
    // 필요시 추가 로직 구현
  };

  const handleScheduleSend = (scheduledDate: Date) => {
    // 예약 전송 완료 후 모달 닫기 (MailCard 내부에서 처리됨)
    // 필요시 추가 로직 구현
  };

  // ✅ 인증 확인 전에는 로딩 표시
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-yellow-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-lg text-gray-600 font-medium">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-yellow-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-6">
      {isLoading && (
        <div className="col-span-full text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-400 rounded-full animate-spin" />
            <p className="text-zinc-600 font-medium">주민 목록을 불러오는 중...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="col-span-full text-center py-12">
          <div className="bg-red-100 border-2 border-red-300 text-red-700 px-6 py-4 rounded-lg inline-block">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* 백엔드 응답이 배열이 아닐 경우 fallback UI */}
      {!isLoading && !error && !isValidResponse && (
        <div className="col-span-full text-center py-12">
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-6 max-w-md mx-auto shadow-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              주민 데이터를 불러올 수 없습니다
            </h3>
            <p className="text-yellow-700 text-sm">
              백엔드에서 주민 목록 데이터가 준비되지 않았습니다.
              <br />
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      )}

      {/* 정상 응답이고 주민이 있는 경우 */}
      {!isLoading && !error && isValidResponse && villagers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {villagers.map((villager) => (
            <div
              key={villager.id}
              onClick={() => handleVillagerClick(villager)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <VillagerCard
                name={villager.name}
                imageUrl={villager.imageUrl}
                isPopular={villager.popularityRank !== undefined && villager.popularityRank <= 3}
                popularityRank={villager.popularityRank}
                popularityCount={villager.popularityCount}
                exampleSentence={villager.toneExample}
              />
            </div>
          ))}
        </div>
      )}

      {/* 정상 응답이지만 주민이 없는 경우 */}
      {!isLoading && !error && isValidResponse && villagers.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-sky-100 inline-block">
            <p className="text-zinc-600 font-medium">아직 선택 가능한 주민이 없습니다.</p>
          </div>
        </div>
      )}

      {/* 이메일 송신 모달 */}
      {isModalOpen && selectedVillager && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 닫기 버튼 */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full 
                         hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-zinc-500"
              aria-label="모달 닫기"
            >
              <svg
                className="w-6 h-6 text-zinc-900 dark:text-zinc-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* MailCardForm 컴포넌트 */}
            {selectedVillager.toneType ? (
              <>
                {console.log(`[MainPage] MailCardForm 렌더링 - villagerToneType:`, selectedVillager.toneType)}
                <MailCardForm
                  villagerStickerUrl={selectedVillager.imageUrl}
                  villagerName={selectedVillager.name}
                  villagerId={selectedVillager.id}
                  villagerCatchphrase={selectedVillager.toneExample}
                  villagerToneType={selectedVillager.toneType}
                  onSendNow={handleSendNow}
                  onScheduleSend={handleScheduleSend}
                />
              </>
            ) : (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
                <p className="text-red-700 font-medium">
                  말투 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.
                </p>
                <p className="text-sm text-red-600 mt-2">
                  (villagerId: {selectedVillager.id}, toneType: {selectedVillager.toneType || "undefined"})
                </p>
                <p className="text-xs text-red-500 mt-2">
                  전체 villager 데이터: {JSON.stringify(selectedVillager, null, 2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
