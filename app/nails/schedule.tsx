import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { store } from "@/services/store";
import api from "@/lib/api";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { cloneUniformsGroups } from "three/src/renderers/shaders/UniformsUtils";

interface Store {
  ID: string;
  ImageUrl: string;
  Description: string;
  Longtitude: number;
  Latitude: number;
  Address: string;
  averageRating: number;
}

interface Artist {
  ID: string;
  YearsOfExperience: number;
  Level: string;
  User: {
    FullName: string;
    ImageUrl: string;
  };
}

interface ArtistStore {
  ArtistId: string;
  StoreId: string;
  WorkingDate: string;
  StartTime: string;
  EndTime: string;
  Artist: Artist;
}

interface TimeSlot {
  start: string;
  end: string;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h < 20; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

const StoreSelectionScreen = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [artists, setArtists] = useState<ArtistStore[]>([]);
  const [suggestedTimeSlots, setSuggestedTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    fetchingStores: false,
    fetchingArtists: false,
    predictingTime: false,
    booking: false
  });
  const [customerSelectedId, setCustomerSelectedId] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const TOGETHER_AI_URL = "https://api.together.xyz/v1/chat/completions";
  const API_KEY = "469acea901a9fff8210792874151eaa2582149dbf8fa1a28db48ebb4c5901382";
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistStore | null>(null);

  useEffect(() => {
    const getCustomerSelectedId = async () => {
      const id = await AsyncStorage.getItem("customerSelected");
      if (id) {
        setCustomerSelectedId(JSON.parse(id));
      }
    };
    getCustomerSelectedId();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setLocationError("Error getting location");
      }
    })();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStates(prev => ({ ...prev, fetchingStores: true }));
      try {
        const data = await store.getStore();
        console.log(data);
        setStores(data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, fetchingStores: false }));
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const handleSuggestTimeSlots = async () => {
      if (!selectedStore || !selectedDate) {
        console.log("Missing required data:", { selectedStore, selectedDate });
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('date', selectedDate);
        formData.append('storeId', selectedStore.ID);

        console.log("Sending request to suggest time slots:", {
          date: selectedDate,
          storeId: selectedStore.ID
        });

        const res = await axios.post(
          `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Booking/SuggestTimeSlots`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (!res.data || !Array.isArray(res.data)) {
          console.error("Invalid response format:", res.data);
          return;
        }

        console.log("SuggestTimeSlots response:", res.data);
        setSuggestedTimeSlots(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("API Error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
        } else {
          console.error("Unexpected error:", error);
        }
        // Set empty array on error to prevent UI issues
        setSuggestedTimeSlots([]);
      }
    };

    handleSuggestTimeSlots();
  }, [selectedStore, selectedDate]);

  const isSuggestedTimeSlot = (time: string) => {
    return suggestedTimeSlots.some(slot => {
      const slotTime = slot.start.split(':')[0] + ':00';
      return slotTime === time;
    });
  };

  const fetchArtists = async () => {
    if (!selectedStore || !selectedDate || !selectedTime) return null;

    setLoadingStates(prev => ({ ...prev, fetchingArtists: true }));
    try {
      const formData = new FormData();
      formData.append('storeId', selectedStore.ID);
      formData.append('date', selectedDate);
      formData.append('time', selectedTime);
      if (customerSelectedId) {
        formData.append('customerSelectedId', customerSelectedId);
      }

      const response = await api.post("/api/Booking/SuggestArtist", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("AAAAAAAAAAAAAAAAAA", response)
      setArtists(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching artists:", error);
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingArtists: false }));
    }
  };
  const fetchArtist = async () => {
    if (!selectedStore || !selectedDate || !selectedTime) {
      console.log("Missing required data:", { selectedStore, selectedDate, selectedTime });
      return null;
    }

    setLoadingStates(prev => ({ ...prev, fetchingArtists: true }));
    try {
      const apiUrl = `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/artistStore?$filter=storeId eq ${selectedStore.ID} and ${selectedTime} ge startTime and ${selectedTime} le endTime and ${selectedDate} eq workingDate
      &$select=artistId,storeId,workingDate,endTime,startTime
      &$expand=store($select=id),artist($select=yearsOfExperience,level,id,averageRating;$expand=user($select=fullName,imageUrl))`;

      const response = await api.get(apiUrl);

      if (!response.data || !response.data.value || response.data.value.length === 0) {
        console.log("No artists found for the selected criteria");
        return null;
      }

      return response;
    } catch (error) {
      console.error("Error fetching artists:", error);
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingArtists: false }));
    }
  };



  const fetchCustomerSelectedServices = async (customerSelectedId: string) => {
    if (!customerSelectedId) {
      console.log("Missing customerSelectedId");
      return null;
    }

    try {
      const query = `
        $filter=id eq ${customerSelectedId} 
        &$select=id 
        &$expand=nailDesignServiceSelecteds(
          $select=nailDesignServiceId;
          $expand=nailDesignService(
            $select=id;
            $expand=service($select=name,description,price,averageDuration)
          )
        )
      `;

      const response = await api.get(`/odata/customerSelected?${query}`);

      if (!response.data || !response.data.value || response.data.value.length === 0) {
        console.log("No customer selected services found");
        return null;
      }

      return response;
    } catch (error) {
      console.error("Error fetching customer selected services:", error);
      return null;
    }
  };

  const handlePredict = async () => {
    if (!customerSelectedId) {
      console.log("Missing customerSelectedId");
      return null;
    }
    if (!selectedStore || !selectedDate || !selectedTime) {
      console.log("Missing required booking data:", { selectedStore, selectedDate, selectedTime });
      return null;
    }
    setLoadingStates(prev => ({ ...prev, predictingTime: true }));
    try {
      const artistData = await fetchArtist();
      const bookingData = await fetchCustomerSelectedServices(customerSelectedId);
      console.log("artistData", artistData);
      console.log("bookingData", bookingData);
      if (!artistData || !bookingData) {
        console.log("Failed to fetch required data:", { artistData: !!artistData, bookingData: !!bookingData });
        return null;
      }
      const predictedTime = await predictCompletionTime(bookingData, artistData);
      return predictedTime;
    } catch (error) {
      console.error("Error in handlePredict:", error);
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, predictingTime: false }));
    }
  };

  const predictCompletionTime = async (bookingData: any, artistData: any) => {
    setLoadingStates(prev => ({ ...prev, predictingTime: true }));
    try {
      const requestBody = {
        model: "meta-llama/Llama-Vision-Free",
        messages: [
          {
            role: "A professional nail artist",
            content: `Hãy trả lời một con số cụ thể, không cần phân tích, dự đoán thời gian hoàn thành dịch vụ dựa vào các thông tin Booking ${JSON.stringify(bookingData)} và thông tin của Artist ${JSON.stringify(artistData)}, nếu lỗi thì trả về mặc định là 60 phút`
          }
        ],
        temperature: 0.7
      };
      const response = await axios.post(TOGETHER_AI_URL, requestBody, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      if (response.data?.choices?.length > 0) {
        const predictedTime = parseInt(response.data.choices[0].message.content, 10);
        return isNaN(predictedTime) || predictedTime <= 0 ? 60 : predictedTime;
      }
      return 60;
    } catch (error) {
      console.error("Error predicting completion time:", error);
      return 60;
    } finally {
      setLoadingStates(prev => ({ ...prev, predictingTime: false }));
    }
  };
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };
  const handleArtistSelect = (artist: ArtistStore) => {
    setSelectedArtist(artist);
    setShowConfirmation(true);
  };
  const handleConfirmBooking = async () => {
    if (!selectedArtist) return;
    setLoadingStates(prev => ({ ...prev, booking: true }));
    setShowConfirmation(false);
    try {
      const predictEndTime = await handlePredict();
      console.log(predictEndTime);
      const formData = new FormData();
      formData.append("ServiceDate", selectedArtist.WorkingDate);
      formData.append("StartTime", selectedTime || "");
      formData.append("CustomerSelectedId", customerSelectedId || "");
      formData.append("ArtistId", selectedArtist.ArtistId);
      formData.append("StoreId", selectedArtist.StoreId);
      if (predictEndTime) {
        formData.append("EstimateDuration", predictEndTime.toString());
      }
      const response = await api.post("/api/Booking", formData);
      const bookingId = response.data;
      const booking = await api.get(`/odata/booking?$filter=id eq ${bookingId}&$select=id,predictEndTime`);
      const predict = booking.data.value?.[0]?.PredictEndTime;
      const predictEnd = predict ? predict.slice(0, 5) : null;
      if (response.status === 200 && booking) {
        router.push({
          pathname: "/nails/success",
          params: {
            date: selectedDate,
            time: selectedTime,
            artistName: selectedArtist.Artist.User.FullName,
            predictEndTime: predictEnd
          }
        });
      }
    } catch (error) {
      console.error("Error posting booking:", error);
      Alert.alert("Lỗi", "Không thể đặt lịch. Vui lòng thử lại sau.");
    } finally {
      setLoadingStates(prev => ({ ...prev, booking: false }));
    }
  };

  const renderStoreSelection = () => (
    <>
      <Text style={styles.title}>🏠 Chọn một cửa hàng</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.ID}
        renderItem={({ item }) => {
          const distance = location ? calculateDistance(location.coords.latitude, location.coords.longitude, item.Latitude, item.Longtitude) : null;

          console.log("Location:", location?.coords);
          console.log("Store coordinates:", { lat: item.Latitude, lon: item.Longtitude });
          console.log("Calculated distance:", distance);

          return (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedStore(item)}>
              <Image source={{ uri: item.ImageUrl }} style={styles.image} />
              <View style={styles.storeInfo}>
                <View style={styles.storeHeader}>
                  <Ionicons name="business-outline" size={20} color={colors.fifth} />
                  <Text style={styles.storeName}>{item.Address}</Text>
                </View>
                <View style={styles.storeAddress}>
                  <Ionicons name="location-outline" size={16} color={colors.fifth} />
                  <Text style={styles.addressText}>{item.Description}</Text>
                </View>
                <View style={styles.storeRating}>
                  <Ionicons name="star" size={16} color={colors.fifth} />
                  <Text style={styles.ratingText}>{item.AverageRating.toFixed(1)}</Text>
                </View>
                {distance !== null && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="navigate-outline" size={16} color={colors.fifth} />
                    <Text style={styles.distanceText}>{distance} km</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </>
  );

  const isPastDate = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    return selected < today;
  };

  const isPastTime = (time: string) => {
    if (!selectedDate) return false;
    
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    return selectedDateTime < now;
  };

  const renderSchedulingContent = () => {
    const schedulingData = [
      {
        type: "store",
        content: (
          <View style={styles.selectedStore}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business-outline" size={24} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Cửa hàng đã chọn</Text>
            </View>
            {selectedStore && (
              <View style={styles.selectedStoreContent}>
                <Image source={{ uri: selectedStore.ImageUrl }} style={styles.selectedImage} />
                <View style={styles.selectedStoreInfo}>
                  <Text style={styles.selectedStoreName}>{selectedStore.Address}</Text>
                  <Text style={styles.selectedStoreDesc}>{selectedStore.Description}</Text>
                  <View style={styles.selectedStoreRating}>
                    <Ionicons name="star" size={16} color={colors.fifth} />
                    <Text style={styles.ratingText}>{selectedStore.AverageRating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )
      },
      {
        type: "calendar",
        content: (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Chọn ngày</Text>
            </View>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={(day: { dateString: string }) => {
                  if (!isPastDate(day.dateString)) {
                    setSelectedDate(day.dateString);
                  }
                }}
                markedDates={{
                  ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: colors.fifth } } : {}),
                  ...Object.fromEntries(
                    Array.from({ length: 365 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - i - 1);
                      return [date.toISOString().split('T')[0], { disabled: true, disableTouchEvent: true }];
                    })
                  )
                }}
                theme={{
                  selectedDayBackgroundColor: colors.fifth,
                  todayTextColor: colors.fifth,
                  arrowColor: colors.fifth,
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14,
                  textDayFontWeight: "500",
                  textMonthFontWeight: "600",
                  textDayHeaderFontWeight: "500",
                  disabledArrowColor: '#d9d9d9',
                  disabledDotColor: '#d9d9d9',
                  disabledTextColor: '#d9d9d9'
                }}
              />
            </View>
            {selectedDate && (
              <View style={styles.selectedInfo}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.fifth} />
                <Text style={styles.selectedText}>Ngày đã chọn: {selectedDate}</Text>
              </View>
            )}
          </View>
        )
      },
      {
        type: "time",
        content: (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={24} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Chọn giờ</Text>
            </View>
            <View style={styles.timeContainer}>
              {generateTimeSlots().map((time) => {
                const isSuggested = isSuggestedTimeSlot(time);
                const isPast = isPastTime(time);
                console.log("Time slot:", { time, isSuggested, isPast }); // Debug log
                return (
                  <TouchableOpacity 
                    key={time} 
                    style={[
                      styles.timeSlot, 
                      selectedTime === time && styles.selectedTime,
                      isSuggested && styles.suggestedTime,
                      isPast && styles.disabledTime
                    ]} 
                    onPress={() => !isPast && setSelectedTime(time)}
                    disabled={isPast}
                  >
                    <Ionicons 
                      name={selectedTime === time ? "time" : "time-outline"} 
                      size={16} 
                      color={selectedTime === time ? "#fff" : isSuggested ? colors.fifth : isPast ? '#d9d9d9' : colors.fifth} 
                    />
                    <Text style={[
                      styles.timeText, 
                      selectedTime === time && styles.selectedTimeText,
                      isSuggested && styles.suggestedTimeText,
                      isPast && styles.disabledTimeText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedTime && (
              <View style={styles.selectedInfo}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.fifth} />
                <Text style={styles.selectedText}>Giờ đã chọn: {selectedTime}</Text>
              </View>
            )}
            {suggestedTimeSlots.length > 0 && (
              <View style={styles.suggestedInfo}>
                <Ionicons name="information-circle-outline" size={16} color={colors.fifth} />
                <Text style={styles.suggestedText}>Khung giờ được gợi ý</Text>
              </View>
            )}
          </View>
        )
      },
      {
        type: "search",
        content: (
          <TouchableOpacity onPress={fetchArtists} style={[styles.searchButton, loadingStates.fetchingArtists && styles.searchButtonDisabled]} disabled={loadingStates.fetchingArtists}>
            <Ionicons name="search-outline" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>{loadingStates.fetchingArtists ? "Đang tìm..." : "Tìm Artist"}</Text>
          </TouchableOpacity>
        )
      },
      {
        type: "artists",
        content: (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={24} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Danh sách Artist</Text>
            </View>
            {loadingStates.fetchingArtists ? (
              <ActivityIndicator size="large" color={colors.fifth} />
            ) : (
              <FlatList
                data={artists}
                keyExtractor={(item) => item.id}
                renderItem={renderArtistCard}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>Không có Artist nào</Text>
                  </View>
                }
                scrollEnabled={false}
              />
            )}
          </View>
        )
      }
    ];

    return (
      <>
        <FlatList data={schedulingData} keyExtractor={(item, index) => `${item.type}-${index}`} renderItem={({ item }) => item.content} contentContainerStyle={styles.schedulingContainer} />
        {renderConfirmationModal()}
      </>
    );
  };

  const renderConfirmationModal = () => (
    <Modal visible={showConfirmation} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Xác nhận đặt lịch</Text>
            <TouchableOpacity onPress={() => setShowConfirmation(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.confirmationItem}>
              <Ionicons name="business-outline" size={20} color={colors.fifth} />
              <View style={styles.confirmationText}>
                <Text style={styles.confirmationLabel}>Cửa hàng</Text>
                <Text style={styles.confirmationValue}>{selectedStore?.Description}</Text>
              </View>
            </View>

            <View style={styles.confirmationItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.fifth} />
              <View style={styles.confirmationText}>
                <Text style={styles.confirmationLabel}>Ngày</Text>
                <Text style={styles.confirmationValue}>{selectedDate}</Text>
              </View>
            </View>

            <View style={styles.confirmationItem}>
              <Ionicons name="time-outline" size={20} color={colors.fifth} />
              <View style={styles.confirmationText}>
                <Text style={styles.confirmationLabel}>Giờ</Text>
                <Text style={styles.confirmationValue}>{selectedTime}</Text>
              </View>
            </View>

            <View style={styles.confirmationItem}>
              <Ionicons name="person-outline" size={20} color={colors.fifth} />
              <View style={styles.confirmationText}>
                <Text style={styles.confirmationLabel}>Artist</Text>
                <Text style={styles.confirmationValue}>{selectedArtist?.Artist.User.FullName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirmation(false)}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking} disabled={loadingStates.booking}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>{loadingStates.booking ? "Đang xử lý..." : "Xác nhận đặt lịch"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderArtistCard = ({ item }: { item: ArtistStore }) => {
    const artist = item;
    console.log("artist", artist)
    return (
      <View style={styles.artistCard}>
        <View style={styles.artistHeader}>
          <Image source={{ uri: artist.user.imageUrl }} style={styles.artistImage} />
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{artist.user.fullName}</Text>
            <View style={styles.artistLevel}>
              <Ionicons name="ribbon-outline" size={16} color={colors.fifth} />
              <Text style={styles.artistLevelText}>Level: {artist.level}</Text>
            </View>
            <View style={styles.artistRating}>
              <Ionicons name="star" size={16} color={colors.fifth} />
              <Text style={styles.artistRatingText}>Rating: {artist.averageRating.toFixed(1)}</Text>
            </View>
          </View>

        </View>
        <View style={styles.artistDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="briefcase-outline" size={16} color={colors.fifth} />
            <Text style={styles.detailText}>{artist.yearsOfExperience} năm kinh nghiệm</Text>
          </View>
          <TouchableOpacity onPress={() => handleArtistSelect(item)} style={[styles.bookButton, loadingStates.fetchingArtists && styles.bookButtonDisabled]} disabled={loadingStates.fetchingArtists}>
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>{loadingStates.fetchingArtists ? "Đang xử lý..." : "Đặt lịch"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLoadingModal = () => {
    const { fetchingStores, fetchingArtists, predictingTime, booking } = loadingStates;
    const isLoading = fetchingStores || fetchingArtists || predictingTime || booking;
    
    if (!isLoading) return null;

    let loadingText = "Đang xử lý...";
    if (fetchingStores) loadingText = "Đang tải danh sách cửa hàng...";
    if (fetchingArtists) loadingText = "Đang tìm kiếm artist...";
    if (predictingTime) loadingText = "Đang dự đoán thời gian hoàn thành...";
    if (booking) loadingText = "Đang xử lý đặt lịch...";

    return (
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colors.fifth} />
            <Text style={styles.loadingText}>{loadingText}</Text>
            <Text style={styles.loadingSubText}>Vui lòng chờ trong giây lát</Text>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {selectedStore && (
        <View style={styles.headerAbsolute}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.fifth} />
          </TouchableOpacity>
        </View>
      )}

      {!selectedStore ? renderStoreSelection() : renderSchedulingContent()}
      {renderLoadingModal()}
    </View>
  );
};

export default StoreSelectionScreen;

const styles = StyleSheet.create({
  headerAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,

    paddingBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  storeRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginTop: 70,
    marginBottom: 20
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16
  },
  storeInfo: {
    flex: 1,
    gap: 8
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1
  },
  storeAddress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    flex: 1
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  distanceText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500"
  },
  selectedStore: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginTop: 10
  },
  selectedStoreContent: {
    flexDirection: "row",
    gap: 16
  },
  selectedStoreInfo: {
    flex: 1,
    gap: 8
  },
  selectedStoreName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  selectedStoreDesc: {
    fontSize: 14,
    color: "#666"
  },
  selectedStoreRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginVertical: 10
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333"
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginBottom: 12
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
    justifyContent: "space-between"
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: "31%",
    minWidth: 0,
    borderWidth: 1,
    borderColor: "#f5f5f5"
  },
  selectedTime: {
    backgroundColor: colors.fifth,
    borderColor: colors.fifth
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  selectedTimeText: {
    color: "#fff"
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8
  },
  selectedText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500"
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.fifth,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  searchButtonDisabled: {
    opacity: 0.7
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff"
  },
  artistCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  artistHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  artistInfo: {
    flex: 1,
    gap: 4
  },
  artistName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  artistLevel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  artistLevelText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
  },
  artistRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  artistRatingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
  },
  artistDetails: {
    gap: 8
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  detailText: {
    fontSize: 14,
    color: "#666"
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.fifth,
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },
  bookButtonDisabled: {
    opacity: 0.7
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff"
  },
  emptyContainer: {
    alignItems: "center",
    padding: 24
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 8
  },
  schedulingContainer: {
    padding: 16,
    paddingTop: 80,
    paddingBottom: 20
  },
  locationContainer: {
    backgroundColor: "#e3f2fd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center"
  },
  locationText: {
    fontSize: 14,
    color: "#333"
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center"
  },
  errorText: {
    fontSize: 14,
    color: "#c62828"
  },
  description: {
    fontSize: 14,
    color: "#555",
    flex: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333"
  },
  modalBody: {
    padding: 16,
    gap: 16
  },
  confirmationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  confirmationText: {
    flex: 1
  },
  confirmationLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4
  },
  confirmationValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500"
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0"
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center"
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500"
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.fifth
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600"
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  loadingContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%"
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8
  },
  loadingSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center"
  },
  suggestedTime: {
    backgroundColor: '#E3F2FD',
    borderColor: colors.fifth,
    borderWidth: 1
  },
  suggestedTimeText: {
    color: colors.fifth,
    fontWeight: "600"
  },
  suggestedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.fifth
  },
  suggestedText: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "500"
  },
  disabledTime: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d9d9d9'
  },
  disabledTimeText: {
    color: '#d9d9d9'
  }
});
