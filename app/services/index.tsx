import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";
import Header from "@/components/headerCustom";
import { Ionicons } from "@expo/vector-icons";

const services = [
  { id: 1, name: "Rosemary", price: "500,000 VND", hour: "3 hours", image: require("../../assets/images/banner.jpg") },
  { id: 2, name: "Rosemary", price: "500,000 VND", hour: "3 hours", image: require("../../assets/images/image.png") },
  { id: 3, name: "Rosemary", price: "500,000 VND", hour: "3 hours", image: require("../../assets/images/image.png") },
  { id: 4, name: "Rosemary", price: "500,000 VND", hour: "3 hours", image: require("../../assets/images/image.png") },
  { id: 5, name: "Rosemary", price: "500,000 VND", hour: "3 hours", image: require("../../assets/images/image.png") },
  { id: 6, name: "Rosemary", price: "500,000 VND", hour: "3 hours", image: require("../../assets/images/image.png") }
];

export default function Services() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const renderItem = ({ item }: { item: { id: number; name: string; price: string; hour: string; image: any } }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/services/${item.id}`)}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subTitle}>Christmas</Text>
        <View style={styles.row}>
          <Ionicons name="pricetag" style={styles.icon} />
          <Text style={styles.price}>{item.price}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="time" style={styles.icon} />
          <Text style={styles.hour}>{item.hour}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="cart" style={styles.icon} />
          <Text style={styles.slots}>10 Slots</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => {
            /* Handle filter action */
          }}
        >
          <Ionicons name="filter" size={32} color={colors.fifth} />
        </TouchableOpacity>
      </View>
      <FlatList data={services} numColumns={2} key={2} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.third,
    padding: 16
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 16,
    marginBottom: 16
  },
  list: {
    paddingBottom: 20,
    alignItems: "center"
  },
  card: {
    width: "45%",
    backgroundColor: colors.fourth,
    borderRadius: 15,
    margin: 8,
    paddingTop: 60, // Tăng padding top để có đủ không gian cho hình ảnh
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 25,
    marginTop: 50
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: "absolute",
    top: -50,
    zIndex: 1
  },
  infoContainer: {},
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.fifth,
    marginBottom: 4
  },
  subTitle: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "200",
    marginBottom: 4
  },
  price: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.fifth,
    marginBottom: 4
  },
  hour: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "200",
    marginBottom: 4
  },
  slots: {
    fontSize: 12,
    color: colors.fifth,
    marginTop: 4
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4
  },
  icon: {
    marginRight: 8,
    fontSize: 18,
    color: colors.fifth
  }
});
