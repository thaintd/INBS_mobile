import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/api";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import formatVND from "@/lib/formatVND";

interface CartItem {
  NailDesignServiceId: string;
  NailDesignService: {
    Service: {
      Name: string;
      Price: number;
    };
    NailDesign: {
      NailPosition: number;
      IsLeft: boolean;
      DesignId: string;
    };
  };
}

interface GroupedItem {
  designId: string;
  designDetails: {
    Name: string;
    Medias: Array<{
      ImageUrl: string;
    }>;
  };
  items: CartItem[];
}

const getFingerPosition = (nailPosition: number, isLeft: boolean) => {
  const fingers = ["Ngón cái", "Ngón trỏ", "Ngón giữa", "Ngón áp út", "Ngón út"];
  return `${fingers[nailPosition]}, ${isLeft ? "bên trái" : "bên phải"}`;
};

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<Record<string, GroupedItem>>({});
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const isPositionSelected = (nailPosition: number, isLeft: boolean) => {
    return selectedItems.some(item => 
      item.NailDesignService.NailDesign.NailPosition === nailPosition && 
      item.NailDesignService.NailDesign.IsLeft === isLeft
    );
  };

  const toggleItemSelection = (item: CartItem) => {
    const isSelected = selectedItems.some(selected => selected.NailDesignServiceId === item.NailDesignServiceId);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.NailDesignServiceId !== item.NailDesignServiceId));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const isItemSelected = (item: CartItem) => {
    return selectedItems.some(selected => selected.NailDesignServiceId === item.NailDesignServiceId);
  };

  const handleDeleteItem = async (item: CartItem) => {
    try {
      setDeleting(true);
      await api.delete(`/api/Cart?id=${item.NailDesignServiceId}`);
      
      // Remove item from cartItems
      const updatedCartItems = cartItems.filter(cartItem => cartItem.NailDesignServiceId !== item.NailDesignServiceId);
      setCartItems(updatedCartItems);
      
      // Remove item from selectedItems if it was selected
      setSelectedItems(prev => prev.filter(selected => selected.NailDesignServiceId !== item.NailDesignServiceId));
      
      // Update groupedItems
      const updatedGroupedItems = { ...groupedItems };
      const designId = item.NailDesignService.NailDesign.DesignId;
      if (updatedGroupedItems[designId]) {
        updatedGroupedItems[designId].items = updatedGroupedItems[designId].items.filter(
          groupItem => groupItem.NailDesignServiceId !== item.NailDesignServiceId
        );
        
        // Remove design group if no items left
        if (updatedGroupedItems[designId].items.length === 0) {
          delete updatedGroupedItems[designId];
        }
      }
      setGroupedItems(updatedGroupedItems);
      
      // Update total price
      const newTotal = updatedCartItems.reduce((sum, cartItem) => sum + cartItem.NailDesignService.Service.Price, 0);
      setTotalPrice(newTotal);
      
      Alert.alert("Success", "Item removed from cart");
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to remove item from cart");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = await AsyncStorage.getItem("userID");
        if (!userId) return;

        // Fetch cart items
        const cartResponse = await api.get(`/odata/cart?$filter=customerId eq ${userId} &$select=naildesignserviceId
&$expand=nailDesignService($select=serviceId,naildesignId
;$expand=service($select=name,price),naildesign($select=isLeft,nailPosition,imageUrl,designId))`);

        const cartItems = cartResponse.data.value;

        // Get unique designIds
        const uniqueDesignIds = [...new Set(cartItems.map((item) => item.NailDesignService.NailDesign.DesignId))];

        // Fetch design details for each unique designId
        const designPromises = uniqueDesignIds.map((designId) => api.get(`/odata/design?$filter=Id eq ${designId}&$select=id,name&$expand=medias($top=1;$orderby=numerialOrder asc;$select=imageUrl,mediaType)`));

        const designResponses = await Promise.all(designPromises);
        const designDetails = designResponses.reduce((acc, response) => {
          if (response.data.value && response.data.value.length > 0) {
            acc[response.data.value[0].ID] = response.data.value[0];
          }
          return acc;
        }, {});

        console.log("Design Details:", designDetails);

        // Group cart items by designId
        const groupedItems = cartItems.reduce((acc, item) => {
          const designId = item.NailDesignService.NailDesign.DesignId;
          if (!acc[designId]) {
            acc[designId] = {
              designId,
              designDetails: designDetails[designId],
              items: []
            };
          }
          acc[designId].items.push(item);
          return acc;
        }, {});

        console.log("Grouped Items:", groupedItems);

        // Calculate total price
        const total = cartItems.reduce((sum, item) => sum + item.NailDesignService.Service.Price, 0);
        setTotalPrice(total);
        setCartItems(cartItems);
        setGroupedItems(groupedItems);
      } catch (error) {
        console.error("Error fetching items", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const postCustomerSelected = async () => {
    try {
      if (selectedItems.length === 0) {
        Alert.alert("Chưa chọn dịch vụ", "Vui lòng chọn ít nhất một dịch vụ trước khi tiếp tục!");
        return;
      }

      const formData = new FormData();
      formData.append("IsFavorite", "false");

      selectedItems.forEach((item, index) => {
        formData.append(`nailDesignServiceSelecteds[${index}].NailDesignServiceId`, item.NailDesignServiceId);
      });

      const res = await api.post("api/CustomerSelected", formData);
      await AsyncStorage.setItem("customerSelected", JSON.stringify(res.data));
      router.push("/nails/schedule");
    } catch (error) {
      console.error("Error posting customer selected:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fifth} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.fifth} />
        </TouchableOpacity>
        <Text style={styles.title}>Giỏ hàng</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={Object.values(groupedItems)}
            keyExtractor={(item) => item.designId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.designGroup}>
                <View style={styles.designHeader}>
                  <Image source={{ uri: item.designDetails?.Medias[0]?.ImageUrl }} style={styles.designImage} />
                  <Text style={styles.designName}>{item.designDetails?.Name}</Text>
                </View>
                {item.items.map((cartItem) => {
                  const isDisabled = isPositionSelected(
                    cartItem.NailDesignService.NailDesign.NailPosition,
                    cartItem.NailDesignService.NailDesign.IsLeft
                  ) && !isItemSelected(cartItem);
                  
                  return (
                    <View key={cartItem.NailDesignServiceId} style={[styles.card, isDisabled && styles.disabledCard]}>
                      <View style={styles.actions}>
                        <TouchableOpacity 
                          style={[styles.selectButton, isItemSelected(cartItem) && styles.radioButtonSelected]}
                          onPress={() => !isDisabled && toggleItemSelection(cartItem)}
                          disabled={isDisabled}
                        >
                          <View style={[styles.radioButton, isItemSelected(cartItem) && styles.radioButtonSelected]}>
                            {isItemSelected(cartItem) && <View style={styles.radioButtonInner} />}
                          </View>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.info}>
                        <Text style={styles.serviceName}>{cartItem.NailDesignService.Service.Name}</Text>
                        <Text style={styles.fingerPosition}>{getFingerPosition(cartItem.NailDesignService.NailDesign.NailPosition, cartItem.NailDesignService.NailDesign.IsLeft)}</Text>
                        <Text style={styles.price}>{formatVND(cartItem.NailDesignService.Service.Price)}</Text>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteItem(cartItem)}
                          disabled={deleting}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.fifth} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.actionButton} onPress={postCustomerSelected}>
              <Text style={styles.actionButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  backButton: {
    padding: 8
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    color: "#666"
  },
  listContent: {
    padding: 16
  },
  designGroup: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  designHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  designImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  designName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    flex: 1
  },
  card: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 16
  },
  info: {
    flex: 1,
    gap: 4
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  fingerPosition: {
    fontSize: 12,
    color: "#666"
  },
  price: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "500"
  },
  deleteButton: {
    padding: 8,
    opacity: 0.7
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0"
  },
  actionButton: {
    backgroundColor: colors.fifth,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff"
  },
  disabledCard: {
    opacity: 0.5,
  },
  selectButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.eigth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.fifth,

  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.fifth,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
});

export default CartScreen;
