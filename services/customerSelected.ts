import api from "@/lib/api";
import type { CustomerSelected } from "@/types/customerSelected";

class CustomerService {
  async postCustomerSelected(customerSelection) {
    try {
      const response = await api.post("/api/CustomerSelected", customerSelection);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to post customer selected");
    }
  }
}

export const customerService = new CustomerService();
