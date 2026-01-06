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

export async function getVillagers(): Promise<Villager[]> {
  const response = await apiFetch<Villager[]>("/villagers", {
    method: "GET",
  });
  return response.data;
}

export async function getVillagerById(id: number): Promise<Villager> {
  const response = await apiFetch<Villager>(`/villagers/${id}`, {
    method: "GET",
  });
  return response.data;
}

