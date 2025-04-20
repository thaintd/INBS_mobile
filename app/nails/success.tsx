import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
const { width } = Dimensions.get("window");

const SuccessScreen = () => {
  const { date, time, artistName, predictEndTime } = useLocalSearchParams();
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
        <Ionicons name="checkmark-circle" size={100} color={colors.fifth} />
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Đặt lịch thành công!</Text>
        <Text style={styles.subtitle}>Chúng tôi sẽ gặp bạn sớm</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={24} color="#666" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Ngày</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={24} color="#666" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Giờ</Text>
              <Text style={styles.detailValue}>{time}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="hourglass-outline" size={24} color="#666" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Dự kiến hoàn thành</Text>
              <Text style={styles.detailValue}>{predictEndTime}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={24} color="#666" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Artist</Text>
              <Text style={styles.detailValue}>{artistName}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.replace("/home")} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  iconContainer: {
    marginBottom: 30
  },
  contentContainer: {
    width: "100%",
    alignItems: "center"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center"
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500"
  },
  button: {
    backgroundColor: colors.fifth,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: colors.fifth,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});
