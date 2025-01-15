import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const serviceDetails = {
  1: {
    name: "Pink Gradient Design",
    price: "500,000đ",
    duration: "1 hour",
    occasions: ["Christmas", "Party"],
    description: "Elegant and trendy nail design perfect for any special occasion. Using high-quality gel polish for long-lasting wear.",
    images: [require("../../assets/images/sample.jpg"), require("../../assets/images/sample.jpg"), require("../../assets/images/sample.jpg"), require("../../assets/images/sample.jpg")]
  }
};

export default function ServiceDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const service = serviceDetails[1];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header đè lên carousel */}
      <View style={styles.headerAbsolute}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.fifth} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.favoriteButton}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#FF6B6B" : colors.fifth} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel width={screenWidth} height={300} data={service.images} onSnapToItem={setActiveIndex} renderItem={({ item }) => <Image source={item} style={styles.carouselImage} resizeMode="cover" />} />
        </View>

        {/* Thumbnails */}
        <View style={styles.thumbnailContainer}>
          {service.images.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => setActiveIndex(index)} style={[styles.thumbnailWrapper, activeIndex === index && styles.activeThumbnailWrapper]}>
              <Image source={img} style={[styles.thumbnail, activeIndex === index && styles.activeThumbnail]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name}>{service.name}</Text>
          <Text style={styles.price}>{service.price}</Text>

          <View style={styles.infoContainer}>
            {/* Duration */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <Text style={styles.description}>{service.duration}</Text>
            </View>

            {/* Shape */}
            {/* <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="diamond-outline" size={20} color={colors.fifth} />
              </View>
              <Text style={styles.infoText}>Square</Text>
            </View> */}

            {/* Paint Type */}
            {/* <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="color-palette-outline" size={20} color={colors.fifth} />
              </View>
              <Text style={styles.infoText}>Gel Polish</Text>
            </View> */}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          <View style={styles.occasionsContainer}>
            <Text style={styles.sectionTitle}>Perfect For</Text>
            <View style={styles.occasionTags}>
              {service.occasions.map((occasion, index) => (
                <View key={index} style={styles.occasionTag}>
                  <Text style={styles.occasionText}>{occasion}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.branchesContainer}>
          <Text style={styles.sectionTitle}>Available Branches</Text>
          <View style={styles.branchesList}>
            <TouchableOpacity style={styles.branchItem}>
              <View style={styles.branchInfo}>
                <Text style={styles.branchName}>District 1 Branch</Text>
                <Text style={styles.branchAddress}>123 Nguyen Hue Street, D1, HCMC</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.branchItem}>
              <View style={styles.branchInfo}>
                <Text style={styles.branchName}>District 3 Branch</Text>
                <Text style={styles.branchAddress}>45 Vo Van Tan Street, D3, HCMC</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/nails/tryAI")}>
          <Ionicons name="scan-outline" size={20} color={colors.sixth} />
          <Text style={styles.actionButtonText}>Try with AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/nails/additional-services",
              params: { nailId: id }
            })
          }
        >
          <Ionicons name="calendar-outline" size={20} color={colors.sixth} />
          <Text style={styles.actionButtonText}>Continue</Text>
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
  headerAbsolute: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.third,
    justifyContent: "center",
    alignItems: "center"
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.third,
    justifyContent: "center",
    alignItems: "center"
  },
  carouselContainer: {
    backgroundColor: colors.fourth
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  thumbnailContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: colors.third
  },
  thumbnailWrapper: {
    padding: 2,
    borderRadius: 8,
    backgroundColor: colors.fourth
  },
  activeThumbnailWrapper: {
    backgroundColor: colors.fifth
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6
  },
  activeThumbnail: {
    opacity: 0.8
  },
  content: {
    padding: 20
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 8
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.fifth,
    marginBottom: 20
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24
  },
  infoItem: {
    alignItems: "center",
    gap: 8
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.fifth}10`,
    justifyContent: "center",
    alignItems: "center"
  },
  infoText: {
    fontSize: 14,
    color: colors.fifth
  },
  descriptionContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 12
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.fifth
  },
  occasionsContainer: {
    marginBottom: 24
  },
  occasionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  occasionTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${colors.fifth}10`,
    borderRadius: 20
  },
  occasionText: {
    fontSize: 14,
    color: colors.fifth
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.third,
    borderTopWidth: 1,
    borderTopColor: `${colors.fifth}20`,
    gap: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.fifth,
    borderRadius: 25
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.sixth
  },
  branchesContainer: {
    padding: 20,
    paddingTop: 0
  },
  branchesList: {
    gap: 12
  },
  branchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.fourth,
    borderRadius: 12
  },
  branchInfo: {
    flex: 1,
    marginRight: 12
  },
  branchName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  branchAddress: {
    fontSize: 14,
    color: `${colors.fifth}80`
  },
  branchDistance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  distanceText: {
    fontSize: 14,
    color: colors.fifth
  }
});
