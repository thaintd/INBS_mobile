import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

export default function Success() {
  const router = useRouter();
  const scaleValue = new Animated.Value(0);
  const fadeValue = new Animated.Value(0);

  useEffect(() => {
    // Animation for check mark
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 400,
        easing: Easing.bounce,
        useNativeDriver: true
      }),
      // Animation for text
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon Animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleValue }]
            }
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={64} color={colors.sixth} />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeValue
            }
          ]}
        >
          <Text style={styles.title}>Booking Successful!</Text>
          <Text style={styles.message}>
            We're excited to see you on {"\n"}
            <Text style={styles.highlightText}>{new Date().toLocaleDateString()}</Text>
          </Text>
          <Text style={styles.subtitle}>Our nail artist will create the perfect look for you.</Text>
        </Animated.View>

        {/* Reminder */}
        <Animated.View
          style={[
            styles.reminderContainer,
            {
              opacity: fadeValue
            }
          ]}
        >
          <View style={styles.reminderItem}>
            <Ionicons name="time-outline" size={24} color={colors.fifth} />
            <Text style={styles.reminderText}>Please arrive 5 minutes early</Text>
          </View>
          <View style={styles.reminderItem}>
            <Ionicons name="call-outline" size={24} color={colors.fifth} />
            <Text style={styles.reminderText}>We'll send you a reminder</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/(authenticated)")}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.seventh
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  iconContainer: {
    marginBottom: 32
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.fifth,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 40
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.fifth,
    marginBottom: 16,
    textAlign: "center"
  },
  message: {
    fontSize: 18,
    color: colors.fifth,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 26
  },
  highlightText: {
    fontWeight: "700",
    color: colors.fifth
  },
  subtitle: {
    fontSize: 16,
    color: `${colors.fifth}90`,
    textAlign: "center"
  },
  reminderContainer: {
    width: "100%",
    backgroundColor: colors.fourth,
    borderRadius: 16,
    padding: 20,
    gap: 16
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  reminderText: {
    fontSize: 16,
    color: colors.fifth
  },
  bottomAction: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.third,
    borderTopWidth: 1,
    borderTopColor: colors.fourth
  },
  button: {
    backgroundColor: colors.fifth,
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.sixth
  }
});
