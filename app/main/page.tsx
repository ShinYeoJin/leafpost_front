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

  useEffect(() => {
    const fetchVillagers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getVillagers();
        setVillagers(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "주민 목록을 불러오는데 실패했습니다.";
        setError(errorMessage);
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

      {!isLoading && !error && (
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

          {/* empty state */}
          {villagers.length === 0 && (
            <p className="col-span-full text-center text-zinc-500">
              아직 선택 가능한 주민이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
