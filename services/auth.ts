import api from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import type { SignUpData, SignInData, VerifyOTPData, AuthResponse, User, APIResponse, ResendOTPData } from "@/types/auth";

class AuthService {
  async signUp(data: SignUpData): Promise<APIResponse<AuthResponse>> {
    try {
      console.log(data);
      const response = await api.post<APIResponse<AuthResponse>>("/api/Authentication/customer/register", data);
      return response?.data;
    } catch (error: any) {
      throw new Error(error?.response?.data);
    }
  }

  async signIn(data: SignInData): Promise<any> {
    try {
      const response = await api.post("/api/Authentication/customer/login", data);
      if (response.data.accessToken) {
        await AsyncStorage.setItem("token", response.data.accessToken);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Sign in failed");
    }
  }

  async sendOTP(otp: string, phoneNumber: string): Promise<APIResponse<{ message: string }>> {
    try {
      const response = await api.post<APIResponse<{ message: string }>>("/api/Authentication/verify-otp", { phoneNumber, otp });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
  }

  async verifyOTP(data: VerifyOTPData): Promise<APIResponse<{ message: string }>> {
    try {
      const response = await api.post<APIResponse<{ message: string }>>("/api/Authentication/verify-otp", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "OTP verification failed");
    }
  }

  async resendOTP(data: ResendOTPData): Promise<APIResponse<{ message: string }>> {
    try {
      const response = await api.post<APIResponse<{ message: string }>>("/api/Authentication/resend-otp", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "OTP verification failed");
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem("token");
      router.push("/(unauthenticated)/signin");
    } catch (error: any) {
      throw new Error("Sign out failed");
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem("token");
    return !!token;
  }

  async getCurrentUser(): Promise<APIResponse<User>> {
    try {
      const response = await api.get<APIResponse<User>>("/auth/me");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get user info");
    }
  }
}

export const authService = new AuthService();
