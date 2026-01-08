"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import VillagerCard from "@/components/villagers/VillagerCard";
import MailCardForm from "@/components/mail/MailCardForm";
import { getVillagers, type Villager as ApiVillager } from "@/lib/api/villagers";

export default function MainPage() {
  const router = useRouter();
  const [villagers, setVillagers] = useState<ApiVillager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidResponse, setIsValidResponse] = useState<boolean>(true);
  const [selectedVillager, setSelectedVillager] = useState<ApiVillager | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVillagers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getVillagers();
        
        // 배열 검증: response.villagers가 실제 배열인지 확인
        if (Array.isArray(response.villagers)) {
          setVillagers(response.villagers);
          setIsValidResponse(response.isValid);
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
  }, []);

  const handleVillagerClick = (villager: ApiVillager) => {
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
                isPopular={false}
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
            <MailCardForm
              villagerStickerUrl={selectedVillager.imageUrl}
              villagerName={selectedVillager.name}
              villagerId={selectedVillager.id}
              villagerCatchphrase={selectedVillager.toneExample}
              onSendNow={handleSendNow}
              onScheduleSend={handleScheduleSend}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
