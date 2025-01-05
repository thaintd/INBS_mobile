import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

export default function Profile() {
  const router = useRouter();

  const handleSave = () => {
    // Add logic for saving profile details
    console.log("Profile saved!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={32} color={colors.fifth} />
        <View>
          <Text style={styles.welcomeText}>Profile</Text>
        </View>
        <Ionicons name="search-circle" size={32} color={colors.fifth} />
      </View>

      {/* Profile Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={60} color={colors.fifth} />
        </View>
      </View>

      {/* Profile Fields */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Full Name" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Email" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="calendar-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Date of Birth" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Phone Number" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={24} style={[styles.icon, { color: colors.fifth }]} />
        <TextInput placeholder="Address" placeholderTextColor={colors.fifth} style={[styles.input, { color: colors.fifth }]} />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE5DC",
    paddingTop: 10,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  welcomeText: {
    fontWeight: "bold",
    fontSize: 24,
    color: colors.fifth
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.fifth
  },
  searchIcon: {
    color: colors.fifth
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: "#FFD1C1",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.sixth,
    marginBottom: 16,
    paddingBottom: 8
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16
  },
  button: {
    backgroundColor: colors.fifth,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16
  },
  buttonText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "bold"
  }
});
