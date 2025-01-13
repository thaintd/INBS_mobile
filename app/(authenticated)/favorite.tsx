import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

const favoriteNails = [
  {
    id: 1,
    name: "Pink Gradient Design",
    price: 350000,
    image: require("../../assets/images/sample.jpg")
  },
  {
    id: 2,
    name: "Floral Pattern",
    price: 400000,
    image: require("../../assets/images/sample.jpg")
  }
];

export default function Favorite() {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {favoriteNails.map((nail) => (
          <TouchableOpacity key={nail.id} style={styles.card} onPress={() => router.push(`/nails/${nail.id}`)}>
            <View style={styles.cardContent}>
              <Image source={nail.image} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {nail.name}
                </Text>
                <Text style={styles.price}>{formatPrice(nail.price)}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: "/nails/schedule",
                    params: { nailId: nail.id }
                  })
                }
              >
                <Ionicons name="calendar-outline" size={20} color={colors.fifth} />
                <Text style={styles.actionText}>Book Now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.removeButton]}>
                <Ionicons name="heart-dislike-outline" size={20} color={colors.sixth} />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.seventh
  },
  header: {
    padding: 16,
    backgroundColor: colors.third,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.fifth
  },
  content: {
    flex: 1,
    padding: 12
  },
  card: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden"
  },
  cardContent: {
    flexDirection: "row",
    padding: 12
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  info: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 8
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 8
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.fifth
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: `${colors.fifth}20`
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderRadius: 20,
    backgroundColor: `${colors.fifth}10`,
    borderWidth: 1,
    borderColor: colors.fifth
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.fifth
  },
  removeButton: {
    backgroundColor: colors.fifth,
    borderColor: colors.fifth
  },
  removeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.sixth
  }
});
