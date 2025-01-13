import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

export default function Profile() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.fifth} />
        </TouchableOpacity>
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.sixth} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color={colors.sixth} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Jessica Williams</Text>
          <Text style={styles.email}>jessica.w@gmail.com</Text>
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
              <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor={`${colors.fifth}80`} />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Ionicons name="call-outline" size={20} color={colors.fifth} />
                <Text style={styles.labelText}>Phone Number</Text>
              </View>
              <TextInput style={styles.input} placeholder="Enter phone number" placeholderTextColor={`${colors.fifth}80`} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Ionicons name="calendar-outline" size={20} color={colors.fifth} />
                <Text style={styles.labelText}>Date of Birth</Text>
              </View>
              <TextInput style={styles.input} placeholder="DD/MM/YYYY" placeholderTextColor={`${colors.fifth}80`} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Ionicons name="location-outline" size={20} color={colors.fifth} />
                <Text style={styles.labelText}>Home Address</Text>
              </View>
              <TextInput style={styles.input} placeholder="Enter your address" placeholderTextColor={`${colors.fifth}80`} multiline />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={colors.fifth} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.seventh
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.third,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.fifth
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fourth,
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    flex: 1,
    padding: 16
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24
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
    borderColor: colors.sixth
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: `${colors.fifth}80`
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 12
  },
  card: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    padding: 16,
    gap: 16
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
    color: colors.fifth,
    fontWeight: "500"
  },
  input: {
    backgroundColor: colors.third,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.fifth
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32
  },
  logoutButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 25,
    backgroundColor: colors.fourth,
    borderWidth: 1,
    borderColor: colors.fifth
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 25,
    backgroundColor: colors.fifth,
    alignItems: "center"
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.sixth
  }
});
