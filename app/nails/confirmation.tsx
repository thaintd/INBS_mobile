import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

const serviceTypes = {
  regular: {
    name: "Regular Combo",
    price: 500000,
    services: ["Basic nail care", "Regular polish", "Simple design", "1 hour service"]
  },
  vip: {
    name: "VIP Combo",
    price: 800000,
    services: ["Premium nail care", "Gel polish", "Complex design", "Hand massage", "1.5 hour service"]
  }
};

const additionalServicesList = {
  1: {
    name: "3D Nail Art",
    price: 100000
  },
  2: {
    name: "Nail Extension",
    price: 150000
  },
  3: {
    name: "Stone Decoration",
    price: 80000
  }
};

const nailDesign = {
  name: "Pink Gradient Design",
  price: 350000,
  image: require("../../assets/images/sample.jpg")
};

export default function Confirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedServices = JSON.parse((params.additionalServices as string) || "[]");

  const serviceType = serviceTypes[params.serviceType as keyof typeof serviceTypes];
  const additionalServices = selectedServices.map((id: number) => additionalServicesList[id]);

  const totalPrice = nailDesign.price + serviceType.price + additionalServices.reduce((sum: number, service: any) => sum + service.price, 0);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color={colors.fifth} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Selected Design */}
        <View style={styles.designCard}>
          <Image source={nailDesign.image} style={styles.designImage} />
          <View style={styles.designInfo}>
            <Text style={styles.designName}>{nailDesign.name}</Text>
            <Text style={styles.designPrice}>{formatPrice(nailDesign.price)}</Text>
            <View style={styles.designMeta}>
              <Ionicons name="time-outline" size={16} color={colors.fifth} />
              <Text style={styles.designMetaText}>{serviceType.name}</Text>
            </View>
          </View>
        </View>

        {/* Service Package */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Combo</Text>
          <View style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageName}>{serviceType.name}</Text>
              <Text style={styles.packagePrice}>{formatPrice(serviceType.price)}</Text>
            </View>
            <View style={styles.servicesList}>
              {serviceType.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.fifth} />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Additional Services */}
        {additionalServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Services</Text>
            {additionalServices.map((service: any, index: number) => (
              <View key={index} style={styles.addonItem}>
                <Text style={styles.addonName}>{service.name}</Text>
                <Text style={styles.addonPrice}>{formatPrice(service.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Appointment Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Time</Text>
          <View style={styles.timeCard}>
            <View style={styles.timeRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.fifth} />
              <Text style={styles.timeText}>{params.date}</Text>
            </View>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={20} color={colors.fifth} />
              <Text style={styles.timeText}>{params.time}</Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            // Handle booking confirmation
            router.push("/nails/success");
          }}
        >
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
          <Text style={styles.bookButtonPrice}>{formatPrice(totalPrice)}</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.fifth,
    marginLeft: 12
  },
  content: {
    flex: 1,
    padding: 16
  },
  designCard: {
    flexDirection: "row",
    backgroundColor: colors.third,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24
  },
  designImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  designInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center"
  },
  designName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.eigth,
    marginBottom: 4
  },
  designPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.eigth,
    marginBottom: 8
  },
  designMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  designMetaText: {
    fontSize: 14,
    color: colors.eigth
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
  packageCard: {
    backgroundColor: colors.third,
    borderRadius: 12,
    padding: 16
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.eigth
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.eigth
  },
  servicesList: {
    gap: 8
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  serviceText: {
    fontSize: 14,
    color: colors.eigth
  },
  addonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.third,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  addonName: {
    fontSize: 16,
    color: colors.eigth
  },
  addonPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth
  },
  timeCard: {
    backgroundColor: colors.third,
    borderRadius: 12,
    padding: 16,
    gap: 12
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  timeText: {
    fontSize: 16,
    color: colors.eigth
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.third,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.fifth
  },
  bottomAction: {
    padding: 16,
    backgroundColor: colors.third,
    borderTopWidth: 1,
    borderTopColor: colors.fourth
  },
  bookButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.fifth,
    padding: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.sixth
  },
  bookButtonPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.sixth
  }
});
