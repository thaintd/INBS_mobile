import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Dimensions, Animated, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { categoriesService } from "@/services/categories";
import { designService } from "@/services/nailDesign";
import { service } from "@/services/service";
import type { Service } from "@/types/service";
import formatVND from "@/lib/formatVND";
import api from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 160;
const CATEGORY_ITEM_WIDTH = SCREEN_WIDTH / 3.5;

// Map for assigning icons to categories
const CATEGORY_ICONS: Record<string, any> = {
  1: "color-palette-outline",
  2: "cut-outline",
  3: "brush-outline",
  4: "hand-left-outline",
  5: "sparkles-outline",
  6: "water-outline",
  7: "flame-outline",
  8: "eye-outline"
};

// Default icon if category name doesn't match
const DEFAULT_ICON = "ellipsis-horizontal-outline";

interface NailDesign {
  Name: string;
  TrendScore: number;
  AverageRating: number;
  ID: string;
  Medias: Medias[];
}

interface Medias {
  ImageUrl: string;
}

interface BeautyService {
  id: number;
  name: string;
  price: string;
  image: any;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

// const beautyServices: BeautyService[] = [
//   {
//     id: 1,
//     name: "Premium Full Body Massage",
//     price: "499,000đ",
//     image: require("../../assets/images/sample5.jpg")
//   },
//   {
//     id: 2,
//     name: "Luxury Facial Treatment",
//     price: "399,000đ",
//     image: require("../../assets/images/sample6.jpg")
//   },
//   {
//     id: 3,
//     name: "Luxury Facial Treatment",
//     price: "399,000đ",
//     image: require("../../assets/images/sample3.jpg")
//   }
// ];

const banners = [require("../../assets/images/banner.jpg"), require("../../assets/images/banner123.jpg"), require("../../assets/images/banner3.jpg")];

interface LoadingAnimationProps {
  style: ViewStyle;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ style }) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  return <Animated.View style={[style, { opacity: fadeAnim }]} />;
};

export default function Home() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [categories, setCategories] = useState<Category[]>([]);
  const [nailDesigns, setNailDesigns] = useState<NailDesign[]>([]);
  const [beautyServices, setBeautyServices] = useState<Service[]>([]);
  const [nailDesignsRecommend, setNailDesignsRecommend] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.error("Error getting user name:", error);
      }
    };
    getUserName();
  }, []);

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

  useEffect(() => {
    const handleGetCategories = async () => {
      try {
        setLoading(true);
        const res = await categoriesService.getCategory();
        if (res && Array.isArray(res)) {
          const categoriesWithIcons = res.map((category) => ({
            ...category,
            icon: CATEGORY_ICONS[category.id] || DEFAULT_ICON
          }));
          setCategories(categoriesWithIcons);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    handleGetCategories();
  }, []);

  useEffect(() => {
    const handleGetNailDesign = async () => {
      try {
        setLoading(true);
        const res = await designService.getTopTrendingDesigns();
        if (Array.isArray(res)) {
          setNailDesigns(res);
        } else {
          console.error("Unexpected response format:", res);
        }
      } catch (error) {
        console.error("Failed to load nail design:", error);
      } finally {
        setLoading(false);
      }
    };
    handleGetNailDesign();
  }, []);

  useEffect(() => {
    const handleGetNailDesignRecommend = async () => {
      try {
        setLoading(true);
        const res = await designService.getNailDesignsRecommend()
        console.log("nailDesignsRecommend", res);
        setNailDesignsRecommend(res);
      } catch (error) {
        console.error("Failed to load nail design recommend:", error);
      } finally {
        setLoading(false);
      }
    };
    handleGetNailDesignRecommend();
  }, []);
  useEffect(() => {
    const handleGetBeautyServices = async () => {
      try {
        setLoading(true);
        const res = await service.getService();
        console.log(res);
        if (Array.isArray(res)) {
          setBeautyServices(res);
        } else {
          console.error("Unexpectedaa response format:", res);
        }
      } catch (error) {
        console.error("Failed to load beauty services:", error);
      } finally {
        setLoading(false);
      }
    };
    handleGetBeautyServices();
    console.log(beautyServices);
  }, []);

  const getCartCount = async () => {
    try {
      const userId = await AsyncStorage.getItem("userID");
      if (!userId) return;

      const response = await api.get(`/odata/cart?$filter=customerId eq ${userId}&$count=true&$select=nailDesignServiceId`);
      setCartCount(response.data["@odata.count"] || 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    getCartCount();
  }, []);

  const handleCategoryPress = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "nails":
        router.push("/nails");
        break;
      case "services":
      case "hair":
      case "makeup":
      case "massage":
      case "facial":
      case "spa":
      case "waxing":
      case "eyelash":
        router.push("/nails");
        break;
      default:
        router.push("/nails");
        break;
    }
  };

  const renderLoadingSkeleton = () => (
    <>
      {/* Categories Loading */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.skeletonTitle} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScrollContent}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <View style={styles.categoryIcon} />
              </View>
              <View style={styles.skeletonText} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Trending Nails Loading */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonViewAll} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.nailCard}>
              <View style={styles.skeletonImage} />
              <View style={styles.nailInfo}>
                <View style={styles.skeletonNailName} />
                <View style={styles.nailDetails}>
                  <View style={styles.skeletonDetail} />
                  <View style={styles.skeletonDetail} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Beauty Services Loading */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonViewAll} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.serviceCard}>
              <View style={styles.skeletonImage} />
              <View style={styles.serviceInfo}>
                <View style={styles.skeletonServiceName} />
                <View style={styles.skeletonPrice} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <View style={styles.greetingContainer}>
          <LottieView
            source={require("../../assets/hi.json")}
            autoPlay
            loop
            style={styles.waveAnimation}
          />
        </View> */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={colors.fifth} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/nails/cart")} style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={colors.fifth} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.carouselContainer}>
          <Carousel 
            loop 
            width={SCREEN_WIDTH - 32} 
            height={BANNER_HEIGHT} 
            autoPlay={true} 
            data={banners} 
            scrollAnimationDuration={1000} 
            renderItem={({ item }) => (
              <View style={styles.bannerContainer}>
                <Image source={item} style={styles.banner} />
              </View>
            )} 
          />
        </View>
        {loading ? (
          renderLoadingSkeleton()
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="grid-outline" size={24} color={colors.eigth} />
                  <Text style={styles.sectionTitle}>Danh mục</Text>
                </View>
              </View>

              {categories.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScrollContent}>
                  {categories.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.categoryItem} onPress={() => handleCategoryPress(item.name)}>
                      <View style={styles.categoryIconContainer}>
                        <View style={styles.categoryIcon}>
                          <Ionicons name={item.icon as any} size={20} color={colors.fifth} />
                        </View>
                        <View style={styles.categoryIconShadow} />
                      </View>
                      <Text style={styles.categoryText} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScrollContent}>
                  {[1, 2, 3, 4].map((skeleton) => (
                    <View key={skeleton} style={[styles.categoryItem, styles.skeletonItem]}>
                      <View style={[styles.categoryIcon, styles.skeletonIcon]} />
                      <View style={styles.skeletonText} />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                
                  <Ionicons name="heart-circle-outline" size={24} color={colors.eigth} />
                  <Text style={styles.sectionTitle}>Dành cho bạn</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/nails")}>
                  <Text style={styles.viewAll}>Xem tất cả</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.fifth} />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {nailDesignsRecommend.map((design) => (
                  <TouchableOpacity key={design.id} style={styles.nailCard} onPress={() => router.push(`/nails/${design.id}`)}>
                    <Image
                      source={{
                        uri: design.medias[0]?.imageUrl || "https://firebasestorage.googleapis.com/v0/b/fir-realtime-database-49344.appspot.com/o/images%2Fnoimage.jpg?alt=media&token=8ffe560a-6aeb-4a34-8ebc-16693bb10a56&fbclid=IwY2xjawJJERpleHRuA2FlbQIxMAABHfHAoOuBqoR8wcxGYpyXgOUtSMbJ8Pr68s2NIHEAej3f-T6w8AyBaluMqg_aem_RGb79TPRss_OmtwOKp27aA"
                      }}
                      style={styles.nailImage}
                    />
                    <View style={styles.nailInfo}>
                      <View style={styles.nailHeader}>
                        <Ionicons name="color-palette-outline" size={16} color={colors.fifth} />
                        <Text style={styles.nailName} numberOfLines={1}>
                          {design.name}
                        </Text>
                      </View>
                      <View style={styles.nailDetails}>
                        <View style={styles.detailItem}>
                          <Ionicons name="heart-outline" size={14} color={colors.fifth} />
                          <Text style={styles.detailLabel}>Trend:</Text>
                          <Text style={styles.detailValue}>{design.trendScore}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="star-outline" size={14} color={colors.fifth} />
                          <Text style={styles.detailLabel}>Rating:</Text>
                          <Text style={styles.detailValue}>{design.averageRating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
              <View style={styles.section2}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="trending-up-outline" size={24} color={colors.eigth} />
                  <Text style={styles.sectionTitle}>Mẫu nail trending</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/nails")}>
                  <Text style={styles.viewAll}>Xem tất cả</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.fifth} />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {nailDesigns.map((design) => (
                  <TouchableOpacity key={design.ID} style={styles.nailCard} onPress={() => router.push(`/nails/${design.ID}`)}>
                    <Image
                      source={{
                        uri: design.Medias[0]?.ImageUrl || "https://firebasestorage.googleapis.com/v0/b/fir-realtime-database-49344.appspot.com/o/images%2Fnoimage.jpg?alt=media&token=8ffe560a-6aeb-4a34-8ebc-16693bb10a56&fbclid=IwY2xjawJJERpleHRuA2FlbQIxMAABHfHAoOuBqoR8wcxGYpyXgOUtSMbJ8Pr68s2NIHEAej3f-T6w8AyBaluMqg_aem_RGb79TPRss_OmtwOKp27aA"
                      }}
                      style={styles.nailImage}
                    />
                    <View style={styles.nailInfo}>
                      <View style={styles.nailHeader}>
                        <Ionicons name="color-palette-outline" size={16} color={colors.fifth} />
                        <Text style={styles.nailName} numberOfLines={1}>
                          {design.Name}
                        </Text>
                      </View>
                      <View style={styles.nailDetails}>
                        <View style={styles.detailItem}>
                          <Ionicons name="heart-outline" size={14} color={colors.fifth} />
                          <Text style={styles.detailLabel}>Trend:</Text>
                          <Text style={styles.detailValue}>{design.TrendScore}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="star-outline" size={14} color={colors.fifth} />
                          <Text style={styles.detailLabel}>Rating:</Text>
                          <Text style={styles.detailValue}>{design.AverageRating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

          
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sixth
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  greetingContainer: {
    marginLeft: 48,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  waveAnimation: {
    width: 60,
    height: 60,
    transform: [{ scale: 5.5 }]
  },
  carouselContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16
  },
  bannerContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden"
  },
  banner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
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
  categorySlider: {
    marginBottom: 10
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 4
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    width: 80
  },
  categoryIconContainer: {
    position: "relative",
    width: 48,
    height: 48,
    marginBottom: 6
  },
  categoryIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: colors.fourth,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
    shadowColor: colors.eigth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  categoryIconShadow: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 22,
    backgroundColor: `${colors.eigth}20`,
    zIndex: 1
  },
  categoryText: {
    fontSize: 12,
    color: colors.eigth,
    textAlign: "center",
    fontWeight: "500"
  },
  skeletonItem: {
    opacity: 0.5
  },
  skeletonIcon: {
    backgroundColor: "#f0f0f0"
  },
  skeletonText: {
    width: 60,
    height: 12,
    backgroundColor: colors.fourth,
    borderRadius: 6
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,

  },
  
  section2: {
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.eigth
  },
  viewAll: {
    color: colors.fifth,
    fontSize: 14
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  nailCard: {
    width: 220,
    backgroundColor: colors.third,
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
  nailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  nailName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.eigth
  },
  nailDetails: {
    flexDirection: "row",
    gap: 16
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.eigth}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  detailLabel: {
    fontSize: 12,
    color: colors.eigth,
    fontWeight: "500"
  },
  detailValue: {
    fontSize: 12,
    color: colors.eigth,
    fontWeight: "600"
  },
  serviceCard: {
    width: 140,
    backgroundColor: colors.third,
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
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8
  },
  serviceName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.eigth,
    lineHeight: 18
  },
  servicePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.eigth}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  priceLabel: {
    fontSize: 12,
    color: colors.eigth,
    fontWeight: "500"
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.eigth
  },
  categoriesScrollContent: {
    paddingRight: 16
  },
  skeletonTitle: {
    width: 120,
    height: 24,
    backgroundColor: colors.fourth,
    borderRadius: 8
  },
  skeletonViewAll: {
    width: 80,
    height: 20,
    backgroundColor: colors.fourth,
    borderRadius: 8
  },
  skeletonImage: {
    width: "100%",
    height: 140,
    backgroundColor: colors.fourth,
    borderRadius: 8
  },
  skeletonNailName: {
    width: "80%",
    height: 16,
    backgroundColor: colors.fourth,
    borderRadius: 8,
    marginBottom: 8
  },
  skeletonDetail: {
    width: 80,
    height: 20,
    backgroundColor: colors.fourth,
    borderRadius: 8
  },
  skeletonServiceName: {
    width: "90%",
    height: 16,
    backgroundColor: colors.fourth,
    borderRadius: 8,
    marginBottom: 8
  },
  skeletonPrice: {
    width: 100,
    height: 20,
    backgroundColor: colors.fourth,
    borderRadius: 8
  },
  cartButton: {
    position: "relative",
    padding: 4
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.fifth,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4
  },
  cartBadgeText: {
    color: colors.sixth,
    fontSize: 12,
    fontWeight: "bold"
  }
});
