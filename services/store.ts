import api from "@/lib/api";
import type { Store, ArtistStores, Artist } from "@/types/store";

class storeService {
  async getStore(): Promise<Store> {
    try {
      const response = await api.get(`/odata/store
?$select=id,address,description,imageUrl,status,averageRating,longtitude,latitude
`);
      return response.data.value;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get store and artist info");
    }
  }
}

export const store = new storeService();
