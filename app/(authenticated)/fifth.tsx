import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

// Mock data for booked appointments
const appointments = [
  {
    id: 1,
    design: {
      name: "Pink Gradient Design",
      price: 350000,
      image: require("../../assets/images/sample.jpg")
    },
    serviceType: {
      name: "Regular Combo",
      price: 500000,
      services: ["Basic nail care", "Regular polish", "Simple design", "1 hour service"]
    },
    additionalServices: [{ name: "3D Nail Art", price: 100000 }],
    date: "2024-03-21",
    time: "10:30",
    status: "upcoming",
    totalPrice: 950000
  },
  {
    id: 2,
    design: {
      name: "Floral Pattern",
      price: 400000,
      image: require("../../assets/images/sample.jpg")
    },
    serviceType: {
      name: "VIP Combo",
      price: 800000,
      services: ["Premium nail care", "Gel polish", "Complex design", "Hand massage", "1.5 hour service"]
    },
    additionalServices: [],
    date: "2024-03-18",
    time: "15:00",
    status: "completed",
    totalPrice: 1200000
  },
  {
    id: 3,
    design: {
      name: "Floral Pattern",
      price: 400000,
      image: require("../../assets/images/sample.jpg")
    },
    serviceType: {
      name: "VIP Combo",
      price: 800000,
      services: ["Premium nail care", "Gel polish", "Complex design", "Hand massage", "1.5 hour service"]
    },
    additionalServices: [],
    date: "2024-03-18",
    time: "15:00",
    status: "completed",
    totalPrice: 1200000
  }
];

export default function Schedule() {
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
  };

  const getStatusColor = (status: string) => {
    return status === "upcoming" ? colors.fifth : `${colors.fifth}80`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      <ScrollView style={styles.content}>
        {appointments.map((appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(appointment.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>{appointment.status === "upcoming" ? "Upcoming" : "Completed"}</Text>
            </View>

            {/* Design Info */}
            <View style={styles.designSection}>
              <Image source={appointment.design.image} style={styles.designImage} />
              <View style={styles.designInfo}>
                <Text style={styles.designName}>{appointment.design.name}</Text>
                <Text style={styles.designPrice}>{formatPrice(appointment.design.price)}</Text>
                <View style={styles.serviceType}>
                  <Ionicons name="time-outline" size={16} color={colors.fifth} />
                  <Text style={styles.serviceTypeText}>{appointment.serviceType.name}</Text>
                </View>
              </View>
            </View>

            {/* Time Info */}
            <View style={styles.timeSection}>
              <View style={styles.timeRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.fifth} />
                <Text style={styles.timeText}>{appointment.date}</Text>
              </View>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={20} color={colors.fifth} />
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>
            </View>

            {/* Price Summary */}
            <View style={styles.priceSection}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalPrice}>{formatPrice(appointment.totalPrice)}</Text>
            </View>

            {/* Actions */}
            {appointment.status === "upcoming" && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="create-outline" size={20} color={colors.fifth} />
                  <Text style={styles.actionText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                  <Ionicons name="close-outline" size={20} color={colors.sixth} />
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
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
    padding: 12,
    backgroundColor: colors.third,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.fifth
  },
  content: {
    flex: 1,
    padding: 12
  },
  appointmentCard: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600"
  },
  designSection: {
    flexDirection: "row",
    marginBottom: 16
  },
  designImage: {
    width: 70,
    height: 70,
    borderRadius: 8
  },
  designInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center"
  },
  designName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  designPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.fifth,
    marginBottom: 6
  },
  serviceType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  serviceTypeText: {
    fontSize: 14,
    color: colors.fifth
  },
  timeSection: {
    backgroundColor: `${colors.fifth}10`,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 6
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  timeText: {
    fontSize: 16,
    color: colors.fifth
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.fifth
  },
  actions: {
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 20,
    backgroundColor: `${colors.fifth}10`,
    borderWidth: 1,
    borderColor: colors.fifth
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.fifth
  },
  cancelButton: {
    backgroundColor: colors.fifth,
    borderColor: colors.fifth
  },
  cancelText: {
    color: colors.sixth
  }
});
