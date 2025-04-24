import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
import { authService } from "@/services/auth";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

interface User {
  DateOfBirth: string;
  FullName: string;
  ID: string;
  PhoneNumber: string;
  ImageUrl?: string;
}

interface Customer {
  Description: string;
  ID: string;
  User: User;
}

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fullName, setFullName] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("userID");
      setUserId(id);
      if (id) {
        getProfile(id);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (userData?.User) {
      setFullName(userData.User.FullName || "");
      if (userData.User.PhoneNumber) {
        const phone = userData.User.PhoneNumber.replace("+84", "0");
        setPhoneNumber(phone);
      }
      if (userData.User.DateOfBirth) {
        const date = new Date(userData.User.DateOfBirth);
        const formattedDate = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
        setDateOfBirth(formattedDate);
      }
      if (userData.User.ImageUrl) {
        setImage(userData.User.ImageUrl);
      }
    }
  }, [userData]);

  const getProfile = async (userId: string) => {
    try {
      const res = await api.get(`odata/customer?$filter=id eq ${userId}&$select=id,description&$expand=User($select=id,fullName,phoneNumber,dateOfBirth,imageUrl)`);
      setUserData(res.data.value[0]);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    try {
      setSaving(true);

      // Format phone number to +84
      const formattedPhone = phoneNumber.replace(/-/g, "").replace(/^0/, "+84");
      
      // Format date to YYYY-MM-DD
      const [day, month, year] = dateOfBirth.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      const formData = new FormData();
      formData.append("FullName", fullName);
      formData.append("PhoneNumber", formattedPhone);
      formData.append("DateOfBirth", formattedDate);
      
      if (image && image !== userData?.User?.ImageUrl) {
        const imageUri = image;
        const imageName = imageUri.split("/").pop();
        const imageType = "image/jpeg";
        
        formData.append("NewImage", {
          uri: imageUri,
          name: imageName,
          type: imageType
        } as any);
      }

      const response = await api.post("/api/Authentication/changeProfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully");
        getProfile(userId!);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fifth} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color="#fff" />
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{fullName || "User Name"}</Text>
          <Text style={styles.email}>{phoneNumber || "Phone Number"}</Text>
        </View>

        {/* Info Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Ionicons name="person-outline" size={20} color={colors.fifth} />
                <Text style={styles.labelText}>Full Name</Text>
              </View>
              <TextInput 
                style={styles.input} 
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your name" 
                placeholderTextColor="#999" 
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Ionicons name="call-outline" size={20} color={colors.fifth} />
                <Text style={styles.labelText}>Phone Number</Text>
              </View>
              <TextInput
                style={styles.input}
                editable={false}
                value={phoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  if (cleaned.length <= 10) {
                    setPhoneNumber(cleaned);
                  }
                }}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Ionicons name="calendar-outline" size={20} color={colors.fifth} />
                <Text style={styles.labelText}>Date of Birth</Text>
              </View>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999"
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  if (cleaned.length <= 8) {
                    const formatted = cleaned.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
                    setDateOfBirth(formatted);
                  }
                }}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={authService.signOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.fifth} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  content: {
    flex: 1,
    padding: 16
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.fifth,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
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
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4
  },
  email: {
    fontSize: 16,
    color: "#666"
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  inputContainer: {
    gap: 8
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  labelText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333"
  },
  actions: {
    gap: 12,
    marginBottom: 32
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.fifth,
    alignItems: "center"
  },
  saveButtonDisabled: {
    opacity: 0.7
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff"
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.fifth
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa"
  }
});
