import React from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
import Header from "@/components/header";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  const categories = [
    { id: 1, name: "Manos", icon: require("../../assets/images/image.png") },
    { id: 2, name: "Pies", icon: require("../../assets/images/image.png") },
    { id: 3, name: "Manos y pies", icon: require("../../assets/images/image.png") },
    { id: 4, name: "Pedicura", icon: require("../../assets/images/image.png") }
  ];

  const popularServices = [
    { id: 1, name: "Service Manos", price: "5.000.000 vdn", hour: "3 hours", image: require("../../assets/images/banner.jpg") },
    { id: 2, name: "Manos", price: "5.000.000 vdn", hour: "3 hours", image: require("../../assets/images/image.png") },
    { id: 3, name: "Pies", price: "5.000.000 vdn", hour: "3 hours", image: require("../../assets/images/image.png") },
    { id: 4, name: "Manos y pies y pies", price: "5.000.000 vdn", hour: "3 hours", image: require("../../assets/images/image.png") }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header />

      <View style={styles.titleSection}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome,</Text>
          <Text style={styles.titleName}>Nguyễn Trần Duy Thái</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image source={require("../../assets/images/image.png")} style={styles.rightImage} resizeMode="cover" />
          <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", color: colors.fifth }}>AI Tool</Text>
        </View>
      </View>

      <View style={styles.banner}>
        <Image source={require("../../assets/images/banner.jpg")} style={styles.bannerImage} resizeMode="cover" />
      </View>

      <View style={styles.categories}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryCard}>
            <Image source={category.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.popularSection}>
        <Text style={styles.sectionTitle}>Most requested services</Text>
        <Text style={styles.viewAll} onPress={() => router.push("./services")}>
          View all
        </Text>
      </View>

      {/* Popular Services */}
      <FlatList
        data={popularServices}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/services/${item.id}`)}>
            <View style={styles.serviceCard}>
              <Image source={item.image} style={styles.serviceImage} />
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.servicePrice}>{item.price}</Text>
              <Text style={styles.serviceHour}>{item.hour}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.third,
    paddingHorizontal: 16,
    paddingTop: 10
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
  userName: {
    fontSize: 18,
    fontWeight: "bold"
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 70
  },
  textContainer: {
    flex: 2
  },
  title: {
    fontSize: 20,
    marginBottom: 4,
    color: colors.fifth
  },
  titleName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.fifth
  },
  imageContainer: {
    flex: 1,
    height: 70,
    marginLeft: 10,
    borderRadius: 10
  },
  rightImage: {
    width: "100%"
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20
  },
  categoryCard: {
    alignItems: "center"
  },
  categoryIcon: {
    width: 60,
    height: 60,
    marginBottom: 8
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.fifth
  },
  popularSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold"
  },
  viewAll: {
    color: colors.fifth,
    fontSize: 14
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 120,
    padding: 10,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 30
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.fifth,
    marginBottom: 5
  },
  servicePrice: {
    fontSize: 12,
    color: colors.fifth,
    textAlign: "left",
    marginBottom: 5
  },
  serviceHour: {
    fontSize: 12,
    color: colors.fifth,
    fontWeight: "bold"
  },
  banner: {
    width: "100%",
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden"
  },
  bannerImage: {
    width: "100%",
    height: "100%"
  }
});
