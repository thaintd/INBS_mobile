export interface SignUpData {
  DateOfBirth: string;
  password: string;
  FullName: string;
  PhoneNumber: string;
  confirmPassword: string;
}

export interface SignInData {
  phoneNumber: string;
  password: string;
}

export interface VerifyOTPData {
  phoneNumber: string;
  otp: string;
}

export interface ResendOTPData {
  phoneNumber: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: User;
}

export interface APIResponse<T> {
  data: T;
  message: string;
  status: number;
}
