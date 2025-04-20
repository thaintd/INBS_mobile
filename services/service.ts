import api from "@/lib/api";
import type { Service } from "@/types/service";

class serviceService {
  async getService(): Promise<Service> {
    try {
      const response = await api.get(`/odata/service?$filter=isAdditional&$select=id,name,price,imageUrl,description,isAdditional`);
      return response.data.value;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get nail designs");
    }
  }
}

export const service = new serviceService();
