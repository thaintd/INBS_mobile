import React, { useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Dimensions, Animated } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 160;

interface NailDesign {
  id: number;
  name: string;
  price: string;
  duration: string;
  popularity: string;
  location: string;
  image: any;
}

interface BeautyService {
  id: number;
  name: string;
  price: string;
  image: any;
}

const categories = [
  {
    id: 1,
    name: "Nails",
    icon: "color-palette-outline",
    color: "#FF69B4"
  },
  {
    id: 2,
    name: "Services",
    icon: "sparkles-outline",
    color: "#9370DB"
  },
  {
    id: 3,
    name: "AI Tool",
    icon: "scan-outline",
    color: "#4169E1"
  },
  {
    id: 4,
    name: "Schedule",
    icon: "calendar-outline",
    color: "#20B2AA"
  },
  {
    id: 5,
    name: "Favorite",
    icon: "heart-outline",
    color: "#FF6B6B"
  }
];

const nailDesigns: NailDesign[] = [
  {
    id: 1,
    name: "Pink Gradient Design",
    price: "350,000đ",
    duration: "2h",
    popularity: "128 clients love this",
    location: "District 1, HCMC",
    image: require("../../assets/images/sample.jpg")
  },
  {
    id: 2,
    name: "French Manicure Classic",
    price: "280,000đ",
    duration: "1.5h",
    popularity: "89 clients love this",
    location: "District 3, HCMC",
    image: require("../../assets/images/sample2.jpg")
  }
];

const beautyServices: BeautyService[] = [
  {
    id: 1,
    name: "Premium Full Body Massage",
    price: "499,000đ",
    image: require("../../assets/images/sample5.jpg")
  },
  {
    id: 2,
    name: "Luxury Facial Treatment",
    price: "399,000đ",
    image: require("../../assets/images/sample6.jpg")
  },
  {
    id: 3,
    name: "Luxury Facial Treatment",
    price: "399,000đ",
    image: require("../../assets/images/sample3.jpg")
  }
];

const banners = [require("../../assets/images/banner1.jpg"), require("../../assets/images/banner1.jpg"), require("../../assets/images/banner1.jpg")];

export default function Home() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT],
    outputRange: [BANNER_HEIGHT, 0],
    extrapolate: "clamp"
  });

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp"
  });

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT / 2, BANNER_HEIGHT],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp"
  });

  const handleCategoryPress = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "nails":
        router.push("/nails");
        break;
      case "services":
        router.push("/nails");
        break;
      case "ai tool":
        router.push("/nails");
        break;
      case "schedule":
        router.push("/nails");
        break;
      case "favorite":
        router.push("/nails");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bannerContainer,
          {
            height: headerHeight,
            opacity: bannerOpacity
          }
        ]}
      >
        <Carousel loop width={SCREEN_WIDTH} height={BANNER_HEIGHT} autoPlay={true} data={banners} scrollAnimationDuration={1000} renderItem={({ item }) => <Image source={item} style={styles.banner} />} />
      </Animated.View>

      <Animated.View
        style={[
          styles.headerAbsolute,
          {
            backgroundColor: headerBgOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["transparent", colors.first]
            })
          }
        ]}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.fifth} />
          <TextInput style={styles.searchInput} placeholder="Bạn muốn tìm kiếm gì?" placeholderTextColor={`${colors.fifth}80`} />
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={colors.fifth} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="cart-outline" size={24} color={colors.fifth} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView showsVerticalScrollIndicator={false} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16}>
        <View style={{ height: BANNER_HEIGHT + 35 }} />

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoriesItem} onPress={() => handleCategoryPress(category.name)}>
              <View style={styles.categoriesIcon}>
                <Ionicons name={category.icon} size={24} color={category.color} />
              </View>
              <Text style={styles.categoriesText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Nail Designs</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll} onPress={() => router.push("/nails")}>
                View all
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nailDesigns.map((design) => (
              <TouchableOpacity key={design.id} style={styles.nailCard}>
                <Image source={design.image} style={styles.nailImage} />
                <View style={styles.nailInfo}>
                  <Text style={styles.nailName} numberOfLines={1}>
                    {design.name}
                  </Text>
                  <Text style={styles.nailPrice}>{design.price}</Text>
                  <View style={styles.nailDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color={colors.fifth} />
                      <Text style={styles.detailText}>{design.duration}</Text>
                    </View>
                    <View style={styles.popularityContainer}>
                      <Ionicons name="heart-outline" size={14} color={colors.fifth} />
                      <Text style={styles.popularityText}>{design.popularity}</Text>
                    </View>
                  </View>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color={colors.fifth} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {design.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Beauty Services</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {beautyServices.map((service) => (
              <TouchableOpacity key={service.id} style={styles.serviceCard}>
                <Image source={service.image} style={styles.serviceImage} />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName} numberOfLines={2}>
                    {service.name}
                  </Text>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.seventh
  },
  bannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    backgroundColor: colors.fourth
  },
  banner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  headerAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.fourth,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 40
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.fifth
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16
  },
  categoryItem: {
    alignItems: "center",
    width: "22%"
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  categoryText: {
    fontSize: 12,
    color: colors.fifth,
    textAlign: "center"
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 0
  },
  categoriesItem: {
    alignItems: "center",
    width: "20%"
  },
  categoriesIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.fourth,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  categoriesText: {
    fontSize: 12,
    color: colors.fifth,
    textAlign: "center"
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth
  },
  viewAll: {
    color: colors.fifth,
    fontSize: 14
  },
  nailCard: {
    width: 220,
    backgroundColor: colors.fourth,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  nailImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover"
  },
  nailInfo: {
    padding: 12
  },
  nailName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  nailPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.fifth,
    marginBottom: 8
  },
  nailDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  detailText: {
    fontSize: 13,
    color: colors.fifth
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  locationText: {
    fontSize: 13,
    color: colors.fifth,
    flex: 1
  },
  popularityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.fifth}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  popularityText: {
    fontSize: 12,
    color: colors.fifth
  },
  serviceCard: {
    width: 140,
    backgroundColor: colors.fourth,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24
  },
  serviceImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover"
  },
  serviceInfo: {
    padding: 10
  },
  serviceName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 6,
    lineHeight: 18
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.fifth
  }
});
