import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";

export default function Welcome() {
  const router = useRouter();

  const handleNavigateToSignIn = () => {
    router.push("/signin");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Hands</Text>
      <Image source={require("../assets/images/nail.png")} style={styles.image} />
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Fast nail appointment</Text>
        <Text style={styles.subtitle}>booking service</Text>
      </View>
      <TouchableOpacity style={styles.joinButton} onPress={handleNavigateToSignIn}>
        <Text style={styles.joinButtonText}>Join with us</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.third,
    padding: 16
  },
  title: {
    marginTop: 64,
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.first
  },
  image: {
    width: 50,
    height: 50,
    alignSelf: "center",
    marginBottom: 16
  },
  subtitleContainer: {
    flexDirection: "column"
  },
  subtitle: {
    fontSize: 24,
    color: colors.sixth,
    fontWeight: "bold"
  },
  joinButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: colors.first,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5
  },
  joinButtonText: {
    color: colors.third,
    fontWeight: "bold",
    fontSize: 16
  }
});
