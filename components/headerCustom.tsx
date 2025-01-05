import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
import { useRouter } from "expo-router";

const Header = () => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back-circle-outline" size={32} color={colors.fifth} />
      </TouchableOpacity>
      <View>
        <Text style={styles.welcomeText}>INBS</Text>
      </View>
      <Ionicons name="search-circle" size={32} color={colors.fifth} />
    </View>
  );
};

const styles = StyleSheet.create({
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
  }
});

export default Header;
