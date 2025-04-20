import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native";
import { Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import api from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "@/assets/colors/colors";
import { store } from "@/services/store";
import { router } from "expo-router";
import { cloneUniformsGroups } from "three/src/renderers/shaders/UniformsUtils";

interface Service {
  Name: string;
  Description: string;
  Price: number;
  AverageDuration: number;
  NailPosition?: number;
  IsLeft?: boolean;
}

interface NailDesign {
  ID: string;
  Name: string;
  Medias: {
    ImageUrl: string;
    MediaType: number;
  }[];
}

interface NailDesignService {
  ID: string;
  Service: Service;
  NailDesign: {
    DesignId: string;
    NailPosition: number;
    IsLeft: boolean;
    ImageUrl: string;
  };
}

interface NailDesignServiceSelected {
  NailDesignServiceId: string;
  NailDesignService: NailDesignService;
}

interface Artist {
  ID: string;
  Name: string;
  YearsOfExperience: number;
  Level: string;
  User: {
    FullName: string;
    ImageUrl: string;
  };
}

interface Store {
  ID: string;
  ImageUrl: string;
  Description: string;
  Address: string;
}

interface ArtistStore {
  ArtistId: string;
  StoreId: string;
  WorkingDate: string;
  StartTime: string;
  EndTime: string;
  Artist: Artist;
  Store: Store;
}

interface Booking {
  ServiceDate: string;
  StartTime: string;
  PredictEndTime: string;
  Status: number;
  TotalAmount: number;
  ID: string;
  LastModifiedAt: string;
  CustomerSelectedId: string;
  ArtistStoreId: string;
  ArtistId: string;
  StoreId: string;
  artistName?: string;
  services?: DesignGroup[];
  store?: Store;
}

interface CustomerSelected {
  ID: string;
  IsFavorite: boolean;
  Bookings: Booking[];
  NailDesignServiceSelecteds: NailDesignServiceSelected[];
}

interface Customer {
  ID: string;
  CustomerSelecteds: CustomerSelected[];
}

interface CartItem {
  NailDesignServiceId: string;
  NailDesignService: NailDesignService;
}

interface DesignGroup {
  designId: string;
  designDetails?: {
    Name: string;
    Medias: {
      ImageUrl: string;
    }[];
  };
  services: Service[];
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 1:
      return "#4CAF50"; // Confirmed - Màu xanh lá
    case 2:
      return "#9C27B0"; // Serving - Màu xanh dương
    case 3:
      return "#2196F3"; // Completed - Màu tím
    case 0:
      return "#FF9800"; // Waiting - Màu cam
    case -1:
      return "#F44336"; // Cancelled - Màu đỏ
    default:
      return "#9E9E9E"; // Unknown - Màu xám
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return "Đã xác nhận";
    case 2:
      return "Đang phục vụ";
    case 3:
      return "Hoàn thành";
    case 0:
      return "Đang chờ";
    case -1:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

const getFingerPosition = (position: number, isLeft: boolean) => {
  const fingers = ["Ngón cái", "Ngón trỏ", "Ngón giữa", "Ngón áp út", "Ngón út"];
  return `${fingers[position]}, ${isLeft ? "bên trái" : "bên phải"}`;
};

const BookingCard: React.FC<{ 
  booking: Booking;
  isRebooking: boolean;
  onRebook: (booking: Booking) => void;
}> = ({ booking, isRebooking, onRebook }) => {
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(booking.TotalAmount);

  return (
    <View style={styles.card}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="spa" size={20} color={colors.fifth} />
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
        </View>
        {booking.services?.map((designGroup: DesignGroup) => (
          <View key={designGroup.designId} style={styles.designGroup}>
            <View style={styles.designHeader}>
              <Image source={{ uri: designGroup.designDetails?.Medias[0]?.ImageUrl }} style={styles.designImage} />
              <Text style={styles.designName}>{designGroup.designDetails?.Name}</Text>
            </View>
            {designGroup.services.map((service: Service, index: number) => (
              <View key={index} style={styles.serviceItem}>
                <MaterialIcons name="spa" size={20} color={colors.fifth} />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceText}>{service.Name}</Text>
                  <Text style={styles.fingerPosition}>{getFingerPosition(service.NailPosition || 0, service.IsLeft || false)}</Text>
                </View>
                <Text style={styles.servicePrice}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(service.Price)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Tổng cộng</Text>
          <Text style={styles.amountText}>{formattedAmount}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.rebookButton, isRebooking && styles.rebookButtonDisabled]} 
          onPress={() => onRebook(booking)}
          disabled={isRebooking}
        >
          {isRebooking ? (
            <ActivityIndicator size="small" color={colors.fifth} />
          ) : (
            <>
              <MaterialIcons name="event-repeat" size={24} color={colors.fifth} />
              <Text style={styles.rebookButtonText}>Đặt lại</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BookingDetails: React.FC<{
  booking: Booking;
  onClose: () => void;
  onRebook: (booking: Booking) => void;
}> = ({ booking, onClose, onRebook }) => {
  const [isRebooking, setIsRebooking] = useState(false);
  const formattedDate = format(new Date(booking.ServiceDate), "MMMM dd, yyyy");
  const formattedStartTime = booking.StartTime.substring(0, 5);
  const formattedEndTime = booking.PredictEndTime.substring(0, 5);
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(booking.TotalAmount);

  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Chi tiết đặt lịch</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.rebookButton, isRebooking && styles.rebookButtonDisabled]} 
            onPress={() => onRebook(booking)}
            disabled={isRebooking}
          >
            {isRebooking ? (
              <ActivityIndicator size="small" color={colors.fifth} />
            ) : (
              <>
                <MaterialIcons name="event-repeat" size={24} color={colors.fifth} />
                <Text style={styles.rebookButtonText}>Đặt lại</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.detailsCard}>
          <View style={styles.bookingInfo}>
            <View style={styles.dateTimeInfo}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="event" size={24} color={colors.fifth} />
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
              <View style={styles.timeContainer}>
                <MaterialIcons name="schedule" size={16} color={colors.fifth} />
                <Text style={styles.timeText}>
                  {formattedStartTime} - {formattedEndTime}
                </Text>
              </View>
            </View>
            <View style={[styles.statusContainer, { backgroundColor: colors.fifth }]}>
              <Text style={styles.statusText}>Hoàn thành</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Nghệ sĩ</Text>
            </View>
            <View style={styles.artistContainer}>
              <Image 
                source={{ uri: `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/User/GetImage?userId=${booking.ArtistId}` }} 
                style={styles.artistImage} 
              />
              <View style={styles.artistInfo}>
                <Text style={styles.artistName}>{booking.artistName || "Chưa xác định"}</Text>
                <Text style={styles.storeName}>{booking?.store?.Address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="spa" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Dịch vụ</Text>
            </View>
            {booking.services?.map((designGroup: DesignGroup) => (
              <View key={designGroup.designId} style={styles.designGroup}>
                <View style={styles.designHeader}>
                  <Image source={{ uri: designGroup.designDetails?.Medias[0]?.ImageUrl }} style={styles.designImage} />
                  <Text style={styles.designName}>{designGroup.designDetails?.Name}</Text>
                </View>
                {designGroup.services.map((service: Service, index: number) => (
                  <View key={index} style={styles.serviceItem}>
                    <MaterialIcons name="spa" size={20} color={colors.fifth} />
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceText}>{service.Name}</Text>
                      <Text style={styles.fingerPosition}>{getFingerPosition(service.NailPosition || 0, service.IsLeft || false)}</Text>
                    </View>
                    <Text style={styles.servicePrice}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(service.Price)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="store" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Cửa hàng</Text>
            </View>
            <View style={styles.storeContainer}>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {booking?.store?.Address}
                </Text>
                <View style={styles.storeDetail}>
                  <MaterialIcons name="location-on" size={16} color={colors.fifth} style={{ marginTop: 2 }} />
                  <Text style={styles.storeText} numberOfLines={3}>
                    {booking?.store?.Description}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="attach-money" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Tổng tiền</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Tổng cộng</Text>
              <Text style={styles.amountText}>{formattedAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function Favorite() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [rebookingStates, setRebookingStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("userID");
      setUserId(id);
      if (id) {
        fetchBookings(id);
      }
    };
    getUserId();
  }, []);

  const handleRebook = async (booking: Booking) => {
    try {
      setRebookingStates(prev => ({ ...prev, [booking.ID]: true }));
      
      const customerSelectedResponse = await api.get(`/odata/customerSelected?$filter=id eq ${booking.CustomerSelectedId}&$select=id&$expand=nailDesignServiceSelecteds($select=nailDesignServiceId)`);
      const customerSelectedData = customerSelectedResponse.data.value[0];

      if (!customerSelectedData) {
        throw new Error("Không tìm thấy thông tin đặt lịch");
      }

      const newCustomerSelectedResponse = await api.post("/api/CustomerSelected", {
        NailDesignServiceSelecteds: customerSelectedData.NailDesignServiceSelecteds.map((item: any) => ({
          NailDesignServiceId: item.NailDesignServiceId
        }))
      });

      if (!newCustomerSelectedResponse.data) {
        throw new Error("Không thể tạo đặt lịch mới");
      }

      await AsyncStorage.setItem("customerSelected", JSON.stringify(newCustomerSelectedResponse.data));
      router.push("/nails/schedule" as any);
      
    } catch (error: any) {
      console.error("Error rebooking:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể đặt lại lịch. Vui lòng thử lại sau."
      );
    } finally {
      setRebookingStates(prev => ({ ...prev, [booking.ID]: false }));
    }
  };

  const fetchBookings = async (userId: string) => {
    try {
      const response = await api.get(`/odata/customer?$filter=id eq ${userId}
&$select=id
&$expand=customerSelecteds($select=id
;$expand=bookings($select=id,lastModifiedAt,serviceDate,StartTime,PredictEndTime,Status,totalamount,customerSelectedId,artistStoreId;$orderby=lastModifiedAt asc))
`);
      const data = response.data;
      
      if (data.value && data.value.length > 0) {
        const allBookings = data.value[0].CustomerSelecteds.flatMap((selected: CustomerSelected) => selected.Bookings);
        const completedBookings = allBookings.filter((booking: Booking) => booking.Status === 3);

        const bookingsWithDetails = await Promise.all(
          completedBookings.map(async (booking: Booking) => {
            const services = await fetchServices(booking.CustomerSelectedId);
            return {
              ...booking,
              services
            };
          })
        );

        setBookings(bookingsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (customerSelectedId: string) => {
    try {
      const response = await api.get(`/odata/customerSelected?
$filter=id eq ${customerSelectedId}
&$select=id
&$expand=nailDesignServiceSelecteds($select=nailDesignServiceId
;$expand=nailDesignService($select=id,serviceId,naildesignId
;$expand=service($select=name,description,price,averageDuration)
,naildesign($select=designId,nailPosition,isLeft,imageUrl)))`);

      const data = response.data.value[0];
      const services = data?.NailDesignServiceSelecteds || [];

      const uniqueDesignIds = [...new Set(services.map((item: CartItem) => item.NailDesignService.NailDesign.DesignId))];

      const designPromises = uniqueDesignIds.map((designId) => api.get(`/odata/design?$filter=Id eq ${designId}&$select=id,name&$expand=medias($top=1;$orderby=numerialOrder asc;$select=imageUrl,mediaType)`));

      const designResponses = await Promise.all(designPromises);
      const designDetails = designResponses.reduce((acc: { [key: string]: NailDesign }, response) => {
        if (response.data.value && response.data.value.length > 0) {
          acc[response.data.value[0].ID] = response.data.value[0];
        }
        return acc;
      }, {});

      const groupedServices = services.reduce((acc: { [key: string]: any }, item: CartItem) => {
        const designId = item.NailDesignService.NailDesign.DesignId;
        if (!acc[designId]) {
          acc[designId] = {
            designId,
            designDetails: designDetails[designId],
            services: []
          };
        }
        acc[designId].services.push({
          ...item.NailDesignService.Service,
          NailPosition: item.NailDesignService.NailDesign.NailPosition,
          IsLeft: item.NailDesignService.NailDesign.IsLeft
        });
        return acc;
      }, {});

      return Object.values(groupedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      return [];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fifth} />
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có đặt lịch nào đã hoàn thành</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList 
        data={bookings.sort((a, b) => new Date(b.LastModifiedAt).getTime() - new Date(a.LastModifiedAt).getTime())} 
        keyExtractor={(item) => item.ID} 
        renderItem={({ item }) => (
          <BookingCard 
            booking={item} 
            isRebooking={rebookingStates[item.ID] || false}
            onRebook={handleRebook}
          />
        )} 
        contentContainerStyle={styles.listContainer} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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
  listContainer: {
    paddingVertical: 8
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  section: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8
  },
  designGroup: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee"
  },
  designHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  designImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12
  },
  designName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 8
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  fingerPosition: {
    fontSize: 12,
    color: "#666",
    marginTop: 2
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.fifth
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  amountContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  amountLabel: {
    fontSize: 16,
    color: "#6c757d",
    marginRight: 8
  },
  amountText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth,
    marginLeft: 8
  },
  rebookButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.fifth + "20"
  },
  rebookButtonDisabled: {
    opacity: 0.7
  },
  rebookButtonText: {
    color: colors.fifth,
    fontWeight: "600"
  }
});
