import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

const Header = () => {
  return (
    <View style={styles.header}>
      <Ionicons name="notifications" size={32} color={colors.fifth} />
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
