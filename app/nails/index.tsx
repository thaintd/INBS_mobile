import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Modal, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
import { router } from "expo-router";
import { designService } from "@/services/nailDesign";
import api from "@/lib/api";

interface NailDesign {
  Name: string;
  TrendScore: number;
  AverageRating: number;
  ID: string;
  Medias: Medias[];
  CreatedAt: string;
}

interface Medias {
  ImageUrl: string;
}

const priceRanges = ["Under 300k", "300k - 500k", "500k - 1000k", "Over 1000k"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Name A-Z", "Name Z-A"];

export default function Nails() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nailDesigns, setNailDesigns] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [skintones, setSkintones] = useState([]);
  const [paintTypes, setPaintTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("newest");
  const [showMore, setShowMore] = useState(false);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedSkintones, setSelectedSkintones] = useState<string[]>([]);
  const [selectedPaintTypes, setSelectedPaintTypes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [showMoreOccasions, setShowMoreOccasions] = useState(false);
  const [showMoreSkintones, setShowMoreSkintones] = useState(false);
  const [showMorePaintTypes, setShowMorePaintTypes] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showMoreColors, setShowMoreColors] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [colorsRes, occasionsRes, skintonesRes, paintTypesRes] = await Promise.all([api.get("/api/Adjective/Colors"), api.get("/api/Adjective/Occasions"), api.get("/api/Adjective/Skintone"), api.get("/api/Adjective/PaintType")]);
        setColors(colorsRes.data);
        setOccasions(occasionsRes.data);
        setSkintones(skintonesRes.data);
        setPaintTypes(paintTypesRes.data);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const handleGetNailDesign = async () => {
      try {
        setLoading(true);

        // Build OData query
        let query = "/odata/design?$select=id,name,trendscore,averageRating,createdAt&$expand=medias($orderby=numerialOrder asc;$top=1;$select=imageUrl)";

        // Add sorting first
        switch (activeTab) {
          case "newest":
            query += `&$orderby=createdAt ${sortDirection === "asc" ? "asc" : "desc"}`;
            break;
          case "rating":
            query += `&$orderby=averageRating ${sortDirection === "asc" ? "asc" : "desc"}`;
            break;
          case "trend":
            query += `&$orderby=trendscore ${sortDirection === "asc" ? "asc" : "desc"}`;
            break;
        }

        // Add filter conditions
        const filters = ["isDeleted eq false"];

        if (selectedOccasions.length > 0) {
          filters.push(`preferences/any(p: p/preferenceType eq 1 and p/preferenceId in (${selectedOccasions.join(",")}))`);
        }

        if (selectedSkintones.length > 0) {
          filters.push(`preferences/any(p: p/preferenceType eq 3 and p/preferenceId in (${selectedSkintones.join(",")}))`);
        }

        if (selectedPaintTypes.length > 0) {
          filters.push(`preferences/any(p: p/preferenceType eq 2 and p/preferenceId in (${selectedPaintTypes.join(",")}))`);
        }

        if (selectedColors.length > 0) {
          filters.push(`preferences/any(p: p/preferenceType eq 0 and p/preferenceId in (${selectedColors.join(",")}))`);
        }

        if (filters.length > 0) {
          query += `&$filter=${filters.join(" and ")}`;
        }

        const response = await api.get(query);
        if (Array.isArray(response.data.value)) {
          setNailDesigns(response.data.value);
        }
      } catch (error) {
        console.error("Failed to load nail design:", error);
      } finally {
        setLoading(false);
      }
    };
    handleGetNailDesign();
  }, [activeTab, sortDirection, selectedOccasions, selectedSkintones, selectedPaintTypes, selectedColors, selectedPriceRange]);

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "newest" && styles.activeTab]}
        onPress={() => {
          setActiveTab("newest");
          setSortDirection("desc");
        }}
      >
        <Ionicons name="time-outline" size={20} color={activeTab === "newest" ? colors.sixth : "#666"} />
        <Text style={[styles.tabText, activeTab === "newest" && styles.activeTabText]}>Mới nhất</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "rating" && styles.activeTab]}
        onPress={() => {
          setActiveTab("rating");
          setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
        }}
      >
        <Ionicons name="star-outline" size={20} color={activeTab === "rating" ? colors.sixth : "#666"} />
        <Text style={[styles.tabText, activeTab === "rating" && styles.activeTabText]}>Đánh giá {activeTab === "rating" && (sortDirection === "desc" ? "↓" : "↑")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "trend" && styles.activeTab]}
        onPress={() => {
          setActiveTab("trend");
          setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
        }}
      >
        <Ionicons name="trending-up-outline" size={20} color={activeTab === "trend" ? colors.sixth : "#666"} />
        <Text style={[styles.tabText, activeTab === "trend" && styles.activeTabText]}>Trending {activeTab === "trend" && (sortDirection === "desc" ? "↓" : "↑")}</Text>
      </TouchableOpacity>
    </View>
  );

  const toggleOccasion = (id: string) => {
    setSelectedOccasions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSkintone = (id: string) => {
    setSelectedSkintones((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const togglePaintType = (id: string) => {
    setSelectedPaintTypes((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleColor = (id: string) => {
    setSelectedColors((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const clearAllFilters = () => {
    setSelectedOccasions([]);
    setSelectedSkintones([]);
    setSelectedPaintTypes([]);
    setSelectedColors([]);
    setSelectedPriceRange("");
  };

  const renderFilterModal = () => (
    <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name="filter-outline" size={24} color={colors.fifth} />
              <Text style={styles.modalTitle}>Bộ lọc</Text>
            </View>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.fifth} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {/* Color Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="color-palette-outline" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Màu sắc</Text>
              </View>
              <View style={styles.filterOptions}>
                {colors.slice(0, showMoreColors ? undefined : 4).map((color: any) => (
                  <TouchableOpacity key={color.id} style={[styles.filterOption, selectedColors.includes(color.id) && styles.filterOptionSelected]} onPress={() => toggleColor(color.id)}>
                    <Text style={[styles.filterOptionText, selectedColors.includes(color.id) && styles.filterOptionTextSelected]}>{color.colorName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {colors.length > 4 && (
                <TouchableOpacity style={styles.moreButton} onPress={() => setShowMoreColors(!showMoreColors)}>
                  <Text style={styles.moreButtonText}>{showMoreColors ? "Thu gọn" : `Xem thêm ${colors.length - 4} màu`}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Occasions Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Dịp</Text>
              </View>
              <View style={styles.filterOptions}>
                {occasions.slice(0, showMoreOccasions ? undefined : 4).map((item: any) => (
                  <TouchableOpacity key={item.id} style={[styles.filterOption, selectedOccasions.includes(item.id) && styles.filterOptionSelected]} onPress={() => toggleOccasion(item.id)}>
                    <Text style={[styles.filterOptionText, selectedOccasions.includes(item.id) && styles.filterOptionTextSelected]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {occasions.length > 4 && (
                <TouchableOpacity style={styles.moreButton} onPress={() => setShowMoreOccasions(!showMoreOccasions)}>
                  <Text style={styles.moreButtonText}>{showMoreOccasions ? "Thu gọn" : `Xem thêm ${occasions.length - 4} dịp`}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Skin Tone Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="color-palette-outline" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Màu da</Text>
              </View>
              <View style={styles.filterOptions}>
                {skintones.slice(0, showMoreSkintones ? undefined : 4).map((tone: any) => (
                  <TouchableOpacity key={tone.id} style={[styles.filterOption, selectedSkintones.includes(tone.id) && styles.filterOptionSelected]} onPress={() => toggleSkintone(tone.id)}>
                    <Text style={[styles.filterOptionText, selectedSkintones.includes(tone.id) && styles.filterOptionTextSelected]}>{tone.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {skintones.length > 4 && (
                <TouchableOpacity style={styles.moreButton} onPress={() => setShowMoreSkintones(!showMoreSkintones)}>
                  <Text style={styles.moreButtonText}>{showMoreSkintones ? "Thu gọn" : `Xem thêm ${skintones.length - 4} màu da`}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Paint Type Section */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="brush-outline" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Loại sơn</Text>
              </View>
              <View style={styles.filterOptions}>
                {paintTypes.slice(0, showMorePaintTypes ? undefined : 4).map((type: any) => (
                  <TouchableOpacity key={type.id} style={[styles.filterOption, selectedPaintTypes.includes(type.id) && styles.filterOptionSelected]} onPress={() => togglePaintType(type.id)}>
                    <Text style={[styles.filterOptionText, selectedPaintTypes.includes(type.id) && styles.filterOptionTextSelected]}>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {paintTypes.length > 4 && (
                <TouchableOpacity style={styles.moreButton} onPress={() => setShowMorePaintTypes(!showMorePaintTypes)}>
                  <Text style={styles.moreButtonText}>{showMorePaintTypes ? "Thu gọn" : `Xem thêm ${paintTypes.length - 4} loại sơn`}</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
              <Ionicons name="trash-outline" size={20} color={colors.fifth} />
              <Text style={styles.clearButtonText}>Xóa tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={() => setIsModalVisible(false)}>
              <Ionicons name="checkmark-outline" size={20} color={colors.sixth} />
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search and Filter */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Ionicons name="chevron-back-circle-outline" size={28} color={colors.fifth} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.fifth} />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm mẫu nail..." placeholderTextColor={`${colors.fifth}80`} />
        </View>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Ionicons name="options-outline" size={24} color={colors.fifth} />
        </TouchableOpacity>
      </View>

      {renderTabs()}

      {/* Nail Designs Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.preferencesContainer}>
          <TouchableOpacity style={styles.preferencesButton} onPress={() => router.push("/(setup)/preferences")}>
            <View style={styles.preferencesContent}>
              <View style={styles.preferencesLeft}>
                <Ionicons name="person-circle-outline" size={24} color={colors.fifth} />
                <View style={styles.preferencesTextContainer}>
                  <Text style={styles.preferencesTitle}>Tùy chỉnh sở thích</Text>
                  <Text style={styles.preferencesSubtitle}>Điều chỉnh các tùy chọn phù hợp với bạn</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.fifth} />
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.fifth} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {nailDesigns.map((design) => (
              <TouchableOpacity key={design.ID} style={styles.nailCard} onPress={() => router.replace(`/nails/${design.ID}`)}>
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
          </View>
        )}
      </ScrollView>

      {renderFilterModal()}
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
    padding: 16,
    gap: 12,
    backgroundColor: colors.third
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.third,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.fourth
  },
  activeTab: {
    backgroundColor: colors.fifth
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600"
  },
  activeTabText: {
    color: colors.sixth
  },
  drawer: {
    width: Dimensions.get("window").width * 0.8,
    backgroundColor: colors.sixth
  },
  drawerContent: {
    flex: 1,
    backgroundColor: colors.sixth
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.fifth
  },
  drawerScroll: {
    flex: 1
  },
  drawerFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.fourth
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.fifth,
    fontWeight: "500"
  },
  gridContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  nailCard: {
    width: "48%",
    backgroundColor: colors.third,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16
  },
  nailImage: {
    width: "100%",
    height: 150,
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
    flexDirection: "column",
    gap: 8
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.eigth}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start"
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
  filterSection: {
    marginBottom: 24
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.eigth,
    backgroundColor: "transparent"
  },
  filterOptionSelected: {
    backgroundColor: colors.fifth,
    borderColor: colors.fifth
  },
  filterOptionText: {
    color: colors.eigth,
    fontSize: 14
  },
  filterOptionTextSelected: {
    color: colors.sixth
  },
  moreButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8
  },
  moreButtonText: {
    color: colors.fifth,
    fontSize: 14,
    fontWeight: "500"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },
  modalContent: {
    width: "85%",
    height: "100%",
    backgroundColor: colors.sixth,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.fifth
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth
  },
  modalScroll: {
    flex: 1
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.fourth
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.fifth,
    marginRight: 10
  },
  applyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.fifth,
    marginLeft: 10
  },
  clearButtonText: {
    color: colors.fifth,
    fontSize: 16,
    fontWeight: "600"
  },
  applyButtonText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "600"
  },
  preferencesContainer: {
    padding: 16,
    backgroundColor: colors.third
  },
  preferencesButton: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    padding: 16
  },
  preferencesContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  preferencesLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  preferencesTextContainer: {
    flex: 1
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  preferencesSubtitle: {
    fontSize: 14,
    color: "#666"
  }
});

const getContrastColor = (hexColor: string) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};
