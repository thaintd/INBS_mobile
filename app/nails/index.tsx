import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
import { router } from "expo-router";

interface NailDesign {
  id: number;
  name: string;
  price: string;
  duration: string;
  popularity: string;
  location: string;
  image: any;
}

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
  },
  {
    id: 3,
    name: "Pink Gradient Design",
    price: "350,000đ",
    duration: "2h",
    popularity: "128 clients love this",
    location: "District 1, HCMC",
    image: require("../../assets/images/sample3.jpg")
  },
  {
    id: 4,
    name: "Pink Gradient Design",
    price: "350,000đ",
    duration: "2h",
    popularity: "128 clients love this",
    location: "District 1, HCMC",
    image: require("../../assets/images/sample4.jpg")
  },
  {
    id: 5,
    name: "Pink Gradient Design",
    price: "350,000đ",
    duration: "2h",
    popularity: "128 clients love this",
    location: "District 1, HCMC",
    image: require("../../assets/images/sample.jpg")
  }
];

const occasions = ["Christmas", "Birthday", "Wedding", "Valentine", "Anniversary", "Graduation"];
const priceRanges = ["Under 300k", "300k - 500k", "500k - 1000k", "Over 1000k"];
const skinTones = ["Pale", "White", "Tanned", "Brown", "Dark Brown"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Name A-Z", "Name Z-A"];

export default function Nails() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("");

  return (
    <View style={styles.container}>
      {/* Header with Search and Filter */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-circle-outline" size={28} color={colors.fifth} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.fifth} />
          <TextInput style={styles.searchInput} placeholder="Search nail designs..." placeholderTextColor={`${colors.fifth}80`} />
        </View>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Ionicons name="options-outline" size={24} color={colors.fifth} />
        </TouchableOpacity>
      </View>

      {/* Nail Designs Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.preferencesContainer}>
          <TouchableOpacity style={styles.headerRow} onPress={() => router.push("/(setup)/preferences")}>
            <Text style={styles.titleText}>Click here to edit your preferences!</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {nailDesigns.map((design) => (
            <TouchableOpacity key={design.id} style={styles.nailCard} onPress={() => router.push("./nails/[1]")}>
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
        </View>
      </ScrollView>

      {/* Giữ nguyên phần Filter Modal như cũ */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.fifth} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.radioGroup}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity key={option} style={styles.radioOption} onPress={() => setSelectedSort(option)}>
                      <View style={styles.radioButton}>{selectedSort === option && <View style={styles.radioButtonSelected} />}</View>
                      <Text style={styles.radioText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Occasions Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Occasions</Text>
                <View style={styles.filterOptions}>
                  {occasions.map((item) => (
                    <TouchableOpacity key={item} style={styles.filterOption}>
                      <Text style={styles.filterOptionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* <TouchableOpacity style={styles.moreButton}>
                  <Text style={styles.moreButtonText}>More</Text>
                </TouchableOpacity> */}
              </View>

              {/* Price Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.filterOptions}>
                  {priceRanges.map((item) => (
                    <TouchableOpacity key={item} style={styles.filterOption}>
                      <Text style={styles.filterOptionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Skin Tone Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Skin Tone</Text>
                <View style={styles.radioGroup}>
                  {skinTones.map((tone) => (
                    <TouchableOpacity key={tone} style={styles.radioOption}>
                      <View style={styles.radioButton} />
                      <Text style={styles.radioText}>{tone}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  gridContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between" // Tạo khoảng cách đều giữa các cột
  },
  nailCard: {
    width: "48%", // Đảm bảo 2 cột với khoảng cách giữa các card
    backgroundColor: colors.fourth,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16 // Khoảng cách giữa các hàng
  },
  nailImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover"
  },
  nailInfo: {
    padding: 10
  },
  nailName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 4
  },
  nailPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.fifth,
    marginBottom: 8
  },
  nailDetails: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 8
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  detailText: {
    fontSize: 12,
    color: colors.fifth
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  locationText: {
    fontSize: 12,
    color: colors.fifth,
    flex: 1
  },
  popularityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.fifth}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  popularityText: {
    fontSize: 11,
    color: colors.fifth
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: colors.third,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.fifth
  },
  filterSection: {
    marginBottom: 20
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fifth,
    marginBottom: 10
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.fifth,
    backgroundColor: "transparent"
  },
  filterOptionSelected: {
    backgroundColor: colors.fifth
  },
  filterOptionText: {
    color: colors.fifth
  },
  filterOptionTextSelected: {
    color: colors.sixth
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.fourth,
    marginTop: 20
  },
  clearButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.fifth,
    marginRight: 10,
    alignItems: "center"
  },
  applyButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.fifth,
    marginLeft: 10,
    alignItems: "center"
  },
  clearButtonText: {
    color: colors.fifth,
    fontSize: 16,
    fontWeight: "bold"
  },
  applyButtonText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "bold"
  },
  moreButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8
  },
  moreButtonText: {
    color: colors.fifth,
    fontWeight: "bold"
  },
  radioGroup: {
    marginTop: 8
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.fifth,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.fifth
  },
  radioText: {
    fontSize: 16,
    color: colors.fifth
  },
  divider: {
    height: 1,
    backgroundColor: colors.fourth,
    marginVertical: 20
  },
  preferencesContainer: {
    paddingLeft: 20,
    backgroundColor: colors.third
  },

  headerRow: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    justifyContent: "space-between", // Đẩy các phần tử về hai bên
    alignItems: "center" // Căn giữa theo chiều dọc
  },

  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth,
    flexShrink: 1 // Đảm bảo tiêu đề không tràn ra ngoài
  }
});
