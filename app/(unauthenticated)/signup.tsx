import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cloneUniformsGroups } from "three/src/renderers/shaders/UniformsUtils";

const formatDateForAPI = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

export default function SignUp() {
  const params = useLocalSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    FullName: "",
    password: "",
    DateOfBirth: "",
    PhoneNumber: params.phoneNumber as string || "",
    confirmPassword: "",
    Email: ""
  });
  const otpInputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const response = await api.post("/api/Authentication/resend-otp", {
        phoneNumber: formData.PhoneNumber
      });
      
      if (response.data === "OTP is still valid, please use the existing OTP") {
        Alert.alert("Info", "Please use the existing OTP that was sent to your phone.");
      } else {
        setTimeLeft(60);
        Alert.alert("Success", "OTP has been resent");
      }
      // Always show OTP verification screen
      setIsVerifying(true);
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert("Error", "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const otpCode = otp.join("");
      
      const response = await api.post("/api/Authentication/verify-otp", {
        phoneNumber: formData.PhoneNumber,
        otp: otpCode
      });

      if (response.data.accessToken) {
        await AsyncStorage.setItem("token", response.data.accessToken);
        await AsyncStorage.setItem("userID", response.data.userId);
        router.push("/(setup)/preferences");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkPhoneVerification = async (phoneNumber: string) => {
    try {
      const response = await api.get("/api/Authentication/checkPhone", {
        params: { phoneNumber }
      });
      console.log(response);
      // Check if the response indicates the phone is not verified
      return response.data !== "Phone number has not been verified";
    } catch (error) {
      console.error("Error checking phone verification:", error);
      return false;
    }
  };

  if (isVerifying) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
            <Text style={styles.phoneNumber}>{formData.PhoneNumber}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (otpInputs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {timeLeft > 0 ? `Resend code in ${timeLeft}s` : "Didn't receive the code?"}
            </Text>
            {timeLeft === 0 && (
              <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.verifyButton, loading && styles.buttonDisabled]} 
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setIsVerifying(false)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.fifth} />
            <Text style={styles.backText}>Back to Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      setLoading(true);

      // Check if phone number is already registered
      const isPhoneVerified = await checkPhoneVerification(formData.PhoneNumber);
      
      if (!isPhoneVerified) {
        // If phone is not verified, try to register first
        const formDataToSend = new FormData();
        formDataToSend.append("FullName", formData.FullName);
        formDataToSend.append("PhoneNumber", formData.PhoneNumber);
        formDataToSend.append("Email", formData.Email);
        formDataToSend.append("DateOfBirth", formatDateForAPI(formData.DateOfBirth));
        formDataToSend.append("password", formData.password);
        formDataToSend.append("confirmPassword", formData.confirmPassword);

        if (image) {
          const imageUri = image;
          const imageName = imageUri.split("/").pop();
          const imageType = "image/jpeg";
          
          formDataToSend.append("NewImage", {
            uri: imageUri,
            name: imageName,
            type: imageType
          } as any);
        }

        try {
          // Try to register first
          await api.post("/api/Authentication/customer/register", formDataToSend, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });

          // If registration is successful, show OTP verification
          setIsVerifying(true);
          return;
        } catch (error) {
          // If registration fails, it might be because the phone is already registered but not verified
          // In this case, resend OTP
          try {
            await api.post("/api/Authentication/resend-otp", {
              phoneNumber: formData.PhoneNumber
            });
            setTimeLeft(60);
            setIsVerifying(true);
            return;
          } catch (resendError) {
            console.error("Error resending OTP:", resendError);
            Alert.alert("Error", "Failed to resend OTP. Please try again.");
            return;
          }
        }
      }

      // If phone is already verified, show error
      Alert.alert("Error", "This phone number is already registered and verified.");
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={colors.fifth} />
              </View>
            )}
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.slogan}>Nail Beauty Service</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.eigth} />
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              value={formData.FullName} 
              onChangeText={(text) => handleChange("FullName", text)} 
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.eigth} />
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              value={formData.Email} 
              onChangeText={(text) => handleChange("Email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color={colors.eigth} />
            <TextInput 
              style={styles.input} 
              placeholder="Date of Birth (YYYY-MM-DD)" 
              value={formData.DateOfBirth} 
              onChangeText={(text) => handleChange("DateOfBirth", text)} 
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.eigth} />
            <TextInput 
              style={styles.input} 
              placeholder="Phone" 
              value={formData.PhoneNumber} 
              onChangeText={(text) => handleChange("PhoneNumber", text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.eigth} />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              value={formData.password} 
              onChangeText={(text) => handleChange("password", text)} 
              secureTextEntry 
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.eigth} />
            <TextInput 
              style={styles.input} 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChangeText={(text) => handleChange("confirmPassword", text)} 
              secureTextEntry 
            />
          </View>

          <TouchableOpacity style={[styles.signUpButton, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.signUpText}>Create Account</Text>}
          </TouchableOpacity>
          <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

          <TouchableOpacity style={styles.signInButton} onPress={() => router.push("/(unauthenticated)/signin")}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sixth },
  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  avatarContainer: {
    position: "relative",
    marginBottom: 12
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.fifth
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.fifth}20`,
    justifyContent: "center",
    alignItems: "center"
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.fifth,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff"
  },
  slogan: { fontSize: 16, color: colors.fifth, marginTop: 8 },
  formContainer: { flex: 1 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.fifth}10`,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
    borderWidth: 1,
    borderColor: `${colors.fifth}20`
  },
  input: { flex: 1, color: colors.eigth, marginLeft: 12, fontSize: 16 },
  signUpButton: {
    backgroundColor: colors.fifth,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24
  },
  buttonDisabled: { opacity: 0.5 },
  signUpText: { color: colors.sixth, fontSize: 16, fontWeight: "600" },
  signInButton: {
    borderWidth: 1,
    borderColor: colors.fifth,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${colors.fifth}10`
  },
  signInText: { color: colors.fifth, fontSize: 16, fontWeight: "500" },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: colors.eigth,
    marginBottom: 4
  },
  phoneNumber: {
    fontSize: 16,
    color: colors.fifth,
    fontWeight: "500"
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 24
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.fifth,
    borderRadius: 8,
    fontSize: 20,
    color: colors.fifth,
    backgroundColor: "#fff"
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 24
  },
  timerText: {
    fontSize: 14,
    color: colors.eigth,
    marginBottom: 8
  },
  resendText: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "500"
  },
  verifyButton: {
    backgroundColor: colors.fifth,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24
  },
  verifyButtonText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "600"
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  backText: {
    fontSize: 16,
    color: colors.fifth,
    fontWeight: "500"
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.fourth
  },
  orText: {
    color: colors.fifth,
    marginHorizontal: 16,
    fontSize: 14
  },
});
