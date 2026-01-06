import { useState } from "react";

export function useVillager(initialId?: number) {
  const [selectedVillagerId, setSelectedVillagerId] = useState<number | null>(
    initialId ?? null
  );

  const setVillager = (id: number) => {
    setSelectedVillagerId(id);
  };

  return {
    selectedVillagerId,
    setVillager,
  };
}

