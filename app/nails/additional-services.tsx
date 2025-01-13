import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

const serviceTypes = [
  {
    id: "regular",
    name: "Regular Combo",
    price: "500,000đ",
    services: ["Basic nail care", "Regular polish", "Simple design", "1 hour service"]
  },
  {
    id: "vip",
    name: "VIP Combo",
    price: "800,000đ",
    services: ["Premium nail care", "Gel polish", "Complex design", "Hand massage", "1.5 hour service"]
  }
];

const additionalServices = [
  {
    id: 1,
    name: "3D Nail Art",
    price: "100,000đ",
    description: "Beautiful 3D decorations for your nails"
  },
  {
    id: 2,
    name: "Nail Extension",
    price: "150,000đ",
    description: "Extend your natural nails with premium materials"
  },
  {
    id: 3,
    name: "Stone Decoration",
    price: "80,000đ",
    description: "Add sparkle with premium stones"
  }
];

export default function AdditionalServices() {
  const router = useRouter();
  const { nailId } = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState("regular");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const toggleService = (id: number) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color={colors.fifth} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Additional Services</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Selected Design Preview */}
        <View style={styles.selectedDesign}>
          <Image source={require("../../assets/images/sample.jpg")} style={styles.designImage} />
          <View style={styles.designInfo}>
            <Text style={styles.designName}>Pink Gradient Design</Text>
            <Text style={styles.designPrice}>500,000đ</Text>
          </View>
        </View>

        {/* Service Type Selection */}
        <View style={styles.typeSection}>
          <Text style={styles.sectionTitle}>Choose Your Package</Text>
          {serviceTypes.map((type) => (
            <TouchableOpacity key={type.id} style={[styles.typeCard, selectedType === type.id && styles.selectedTypeCard]} onPress={() => setSelectedType(type.id)}>
              <View style={styles.typeHeader}>
                <View>
                  <Text style={styles.typeName}>{type.name}</Text>
                  <Text style={styles.typePrice}>{type.price}</Text>
                </View>
                <View style={[styles.radioButton, selectedType === type.id && styles.radioButtonSelected]}>{selectedType === type.id && <View style={styles.radioInner} />}</View>
              </View>
              <View style={styles.servicesList}>
                {type.services.map((service, index) => (
                  <Text key={index} style={styles.serviceItem}>
                    • {service}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Services */}
        <View style={styles.addonsSection}>
          <Text style={styles.sectionTitle}>Additional Services</Text>
          {additionalServices.map((service) => (
            <TouchableOpacity key={service.id} style={[styles.addonCard, selectedServices.includes(service.id) && styles.selectedAddonCard]} onPress={() => toggleService(service.id)}>
              <View style={styles.addonInfo}>
                <Text style={styles.addonName}>{service.name}</Text>
                <Text style={styles.addonDescription}>{service.description}</Text>
                <Text style={styles.addonPrice}>{service.price}</Text>
              </View>
              <View style={[styles.checkbox, selectedServices.includes(service.id) && styles.checkboxSelected]}>{selectedServices.includes(service.id) && <Ionicons name="checkmark" size={16} color={colors.sixth} />}</View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              router.push({
                pathname: "/nails/schedule",
                params: {
                  nailId: nailId,
                  serviceType: selectedType,
                  additionalServices: JSON.stringify(selectedServices)
                }
              });
            }}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
  selectedDesign: {
    flexDirection: "row",
    backgroundColor: colors.fourth,
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
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  designPrice: {
    fontSize: 15,
    color: colors.fifth
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 16
  },
  typeSection: {
    marginBottom: 24
  },
  typeCard: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  selectedTypeCard: {
    backgroundColor: `${colors.fifth}10`
  },
  typeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  typeName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  typePrice: {
    fontSize: 15,
    color: colors.fifth
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.fifth,
    justifyContent: "center",
    alignItems: "center"
  },
  radioButtonSelected: {
    borderColor: colors.fifth
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.fifth
  },
  servicesList: {
    marginTop: 8
  },
  serviceItem: {
    fontSize: 14,
    color: colors.fifth,
    marginBottom: 4
  },
  addonsSection: {
    marginBottom: 24
  },
  addonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.fourth,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  selectedAddonCard: {
    backgroundColor: `${colors.fifth}10`
  },
  addonInfo: {
    flex: 1,
    marginRight: 12
  },
  addonName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  addonDescription: {
    fontSize: 14,
    color: `${colors.fifth}80`,
    marginBottom: 4
  },
  addonPrice: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.fifth
  },
  checkbox: {
    width: 24,
    height: 24,

    borderWidth: 2,
    borderColor: colors.fifth,
    justifyContent: "center",
    alignItems: "center"
  },
  checkboxSelected: {
    backgroundColor: colors.fifth
  },
  bottomAction: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.third,
    borderTopWidth: 1,
    borderTopColor: colors.fourth
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 12
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: colors.fourth
  },
  backText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth
  },
  continueButton: {
    flex: 1,
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: colors.fifth
  },
  continueText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.sixth
  }
});
