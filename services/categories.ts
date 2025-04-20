import api from "@/lib/api";
import { router } from "expo-router";
import type { Categories } from "@/types/categories";

class CategoriesService {
  async getCategory(): Promise<Categories> {
    try {
      const response = await api.get("/api/Adjective/Categories");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get user info");
    }
  }
}

export const categoriesService = new CategoriesService();
