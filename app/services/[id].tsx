import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const serviceDetails = {
  1: {
    name: "Rosemary",
    price: "500,000 VND",
    hour: "1 hour",
    occasions: ["Noel"],
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    images: [require("../../assets/images/image.png"), require("../../assets/images/banner.jpg"), require("../../assets/images/image.png")]
  }
};

const recommendedServices = [
  {
    id: 1,
    name: "Service A",
    price: "300,000 VND",
    hour: "1 hour",
    image: require("../../assets/images/image.png")
  },
  {
    id: 2,
    name: "Service B",
    price: "400,000 VND",
    hour: "1.5 hours",
    image: require("../../assets/images/banner.jpg")
  },
  {
    id: 3,
    name: "Service C",
    price: "350,000 VND",
    hour: "1 hour",
    image: require("../../assets/images/image.png")
  }
];

export default function ServiceDetail() {
  const router = useRouter();
  const service = serviceDetails[1];
  const [activeIndex, setActiveIndex] = useState(0);

  if (!service) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Service not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color={colors.fifth} />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Details</Text>
        <Ionicons name="notifications-circle-outline" size={32} color={colors.fifth} />
      </View>

      {/* Carousel */}
      <Carousel width={screenWidth} height={250} loop data={service.images} scrollAnimationDuration={1000} onSnapToItem={(index) => setActiveIndex(index)} renderItem={({ item }) => <Image source={item} style={styles.mainImage} />} />

      {/* Thumbnail Carousel */}
      <View style={styles.thumbnailContainer}>
        {service.images.map((img, index) => (
          <TouchableOpacity key={index} onPress={() => setActiveIndex(index)}>
            <Image source={img} style={[styles.thumbnail, activeIndex === index && styles.activeThumbnail]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.likeButton}>
          <Text style={styles.likeText}>{service.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookText}>Book now</Text>
        </TouchableOpacity>
      </View>

      {/* Details Section */}
      <View style={styles.details}>
        <Text style={styles.sectionTitle}>Suitable for occasions:</Text>
        {service.occasions.map((occasion, index) => (
          <Text key={index} style={styles.occasion}>
            • {occasion}
          </Text>
        ))}
        <Text style={styles.price}>{service.price}</Text>
        <Text style={styles.detailText}>Estimated time to complete: {service.hour}</Text>
        <Text style={styles.descriptionTitle}>Description:</Text>
        <Text style={styles.description}>{service.description}</Text>
      </View>

      {/* "May you like" Section */}
      <View style={styles.suggestions}>
        <Text style={styles.sectionTitle}>May you like</Text>
        <FlatList
          data={recommendedServices}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/services/${item.id}`)}>
              <View style={styles.suggestionItem}>
                <Image source={item.image} style={styles.suggestionImage} />
                <Text style={styles.suggestionName}>{item.name}</Text>
                <Text style={styles.suggestionPrice}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.third
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 16
  },
  welcomeText: {
    fontWeight: "bold",
    fontSize: 24,
    color: colors.fifth
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  thumbnailContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8
  },
  thumbnail: {
    width: 80,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent"
  },
  activeThumbnail: {
    borderColor: colors.fifth
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16
  },
  likeButton: {
    backgroundColor: colors.third,
    borderRadius: 50,
    padding: 16
  },
  likeText: {
    fontSize: 18,
    color: colors.fifth
  },
  bookButton: {
    flex: 1,
    backgroundColor: colors.fifth,
    padding: 16,
    borderRadius: 8,
    marginLeft: 16,
    alignItems: "center"
  },
  bookText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.sixth
  },
  details: {
    padding: 16,
    backgroundColor: colors.third
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fifth,
    marginBottom: 8
  },
  occasion: {
    fontSize: 14,
    color: colors.fifth
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.fifth,
    marginVertical: 8
  },
  detailText: {
    fontSize: 14,
    color: colors.fifth,
    marginBottom: 4
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fifth,
    marginTop: 16
  },
  description: {
    fontSize: 14,
    color: colors.fifth,
    marginTop: 4
  },
  suggestions: {
    padding: 16,
    backgroundColor: colors.third
  },
  suggestionItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  suggestionImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.fifth
  },
  suggestionPrice: {
    fontSize: 12,
    color: colors.first
  }
});
