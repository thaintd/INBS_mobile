import api from "@/lib/api";
import type { nailDesign, NailDesignID } from "@/types/nailDesign";

class NailDesignService {
  async getNailDesigns(): Promise<nailDesign> {
    try {
      const response = await api.get(`/odata/design?
$select=id,name,trendscore,averageRating%20
&$expand=medias
($orderby=numerialOrder%20asc;$top=1;$select=imageUrl)
`);
      return response.data.value;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get nail designs");
    }
  }
  async getNailDesignsRecommend(): Promise<nailDesign> {
    try {
      const response = await api.get(`api/Design/Recommendation`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get nail designs");
    }
  }
  async getTopTrendingDesigns(): Promise<nailDesign> {
    try {
      const response = await api.get(`/odata/design?
$orderby=trendscore desc &$top=5&$select=id,name,trendscore,averageRating%20
&$expand=medias
($orderby=numerialOrder%20asc;$top=1;$select=imageUrl)
`);
      return response.data.value;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get top trending designs");
    }
  }
  async getDesignById(id: string): Promise<NailDesignID> {
    try {
      // 🟢 Bước 1: Lấy thông tin cơ bản của design + medias + preferences + nailDesigns
      const designRes = await api.get(`/odata/design?
        $filter=id eq ${id}
        &$select=id,name,description,trendscore,averageRating,
        &$expand=medias($select=numerialOrder,imageUrl,mediatype),preferences,
                nailDesigns($select=id,imageUrl,nailposition,isleft)
      `);

      const design = designRes.data.value[0];

      // 🟢 Bước 2: Lấy danh sách nailDesignServices cho từng nailDesign
      const nailDesignServiceRequests = design.NailDesigns.map((NailDesign) => api.get(`/odata/NailDesignService?$filter=nailDesignId eq ${NailDesign.ID}&$select=id,serviceId`));
      const nailDesignServicesRes = await Promise.all(nailDesignServiceRequests);

      const nailDesignServices = nailDesignServicesRes.reduce((acc, res, index) => {
        acc[design.NailDesigns[index].ID] = res.data.value ?? []; // Đảm bảo không undefined
        return acc;
      }, {} as Record<string, any[]>);

      // 🟢 Bước 3: Lấy thông tin chi tiết của service
      const allServices = Object.values(nailDesignServices).flat();
      const serviceIds = [...new Set(allServices.map((service) => service?.ServiceId))]; // Lọc ID duy nhất

      const serviceRequests = serviceIds.map((serviceId) => api.get(`/odata/service?$filter=id eq ${serviceId}&$select=id,name,imageUrl,price,isAdditional,averageDuration,ImageDescriptionUrl,description`));
      const servicesRes = await Promise.all(serviceRequests);
      const services = servicesRes.map((res) => res.data.value[0]);

      console.log("services", services);

      // 🟢 Gán nailDesignServices vào NailDesigns
      const nailDesignsWithServices = design.NailDesigns.map((NailDesign) => ({
        ...NailDesign,
        nailDesignServices: (nailDesignServices[NailDesign.ID] || []).map((nds) => ({
          ...nds,
          service: services.find((s) => s.ID === nds.ServiceId)
        }))
      }));
      console.log("nailDesignsWithServices", nailDesignsWithServices);

      return {
        ...design,
        NailDesigns: nailDesignsWithServices
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get design by id");
    }
  }
}
export const designService = new NailDesignService();
