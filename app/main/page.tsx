"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VillagerCard from "@/components/villagers/VillagerCard";
import { useVillager } from "@/hooks/useVillager";
import { getVillagers, type Villager as ApiVillager } from "@/lib/api/villagers";

export default function MainPage() {
  const router = useRouter();
  const { setVillager } = useVillager();
  const [villagers, setVillagers] = useState<ApiVillager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidResponse, setIsValidResponse] = useState<boolean>(true);

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
  }, []);

  const handleVillagerClick = (villagerId: number) => {
    setVillager(villagerId);
    router.push(`/villagers/${villagerId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {isLoading && (
        <div className="col-span-full text-center py-12">
          <p className="text-zinc-500">주민 목록을 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="col-span-full text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* 백엔드 응답이 배열이 아닐 경우 fallback UI */}
      {!isLoading && !error && !isValidResponse && (
        <div className="col-span-full text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {villagers.map((villager) => (
            <div
              key={villager.id}
              onClick={() => handleVillagerClick(villager.id)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <VillagerCard
                name={villager.name}
                imageUrl={villager.imageUrl}
                isPopular={false}
                exampleSentence={villager.catchphrase ?? ""}
              />
            </div>
          ))}
        </div>
      )}

      {/* 정상 응답이지만 주민이 없는 경우 */}
      {!isLoading && !error && isValidResponse && villagers.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-zinc-500">아직 선택 가능한 주민이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
