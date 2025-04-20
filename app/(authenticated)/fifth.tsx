import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, ScrollView, Modal, Alert, TextInput } from "react-native";
import { Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import api from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "@/assets/colors/colors";
import { Calendar } from "react-native-calendars";
import { store } from "@/services/store";
import axios from "axios";
import { cloneUniformsGroups } from "three/src/renderers/shaders/UniformsUtils";
import * as ImagePicker from "expo-image-picker";

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

interface Feedback {
  FeedbackType: number;
  Rating: number;
  Content: string;
  TypeId: string;
  BookingId?: string;
  FeedbackImages?: {
    newImage: string;
    ImageUrl: string;
    mediaType: number;
    numerialOrder: number;
  }[];
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

const BookingCard: React.FC<{ booking: Booking; onPress: () => void }> = ({ booking, onPress }) => {
  const formattedDate = format(new Date(booking.ServiceDate), "MMM dd, yyyy");
  const formattedStartTime = booking.StartTime.substring(0, 5);
  const formattedEndTime = booking.PredictEndTime.substring(0, 5);
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(booking.TotalAmount);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={20} color="#666" />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(booking.Status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.Status)}</Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.timeText}>
            {formattedStartTime} - {formattedEndTime}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.amountContainer}>
          <MaterialIcons name="attach-money" size={20} />
          <Text style={styles.amountText}>{formattedAmount}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

const EditBookingModal: React.FC<{
  booking: Booking;
  onClose: () => void;
  onSave: (updatedBooking: Partial<Booking>) => void;
}> = ({ booking, onClose, onSave }) => {
  const [selectedDate, setSelectedDate] = useState<string>(booking.ServiceDate);
  const [selectedTime, setSelectedTime] = useState<string>(booking.StartTime);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<ArtistStore | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [artists, setArtists] = useState<ArtistStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictLoading, setPredictLoading] = useState(false);

  const TOGETHER_AI_URL = "https://api.together.xyz/v1/chat/completions";
  const API_KEY = "469acea901a9fff8210792874151eaa2582149dbf8fa1a28db48ebb4c5901382";

  const predictCompletionTime = async (bookingData: any, artistData: any) => {
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
    }
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await store.getStore();
        if (Array.isArray(data)) {
          setStores(data);
          const currentStore = data.find((s: Store) => s.ID === booking.StoreId);
          setSelectedStore(currentStore || null);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };
    fetchStores();
  }, []);

  const fetchArtists = async () => {
    if (!selectedStore || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const apiUrl = `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/artistStore?$filter=storeId eq ${selectedStore.ID} and ${selectedTime} ge startTime and ${selectedTime} le endTime and ${selectedDate} eq workingDate
      &$select=artistId,storeId,workingDate,endTime,startTime
      &$expand=store($select=id),artist($select=yearsOfExperience,level,id,averageRating;$expand=user($select=fullName,imageUrl))`;
      const response = await api.get(apiUrl);
      setArtists(response.data.value);
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStore && selectedDate && selectedTime) {
      fetchArtists();
    }
  }, [selectedStore, selectedDate, selectedTime]);

  const handleSave = async () => {
    if (!selectedStore || !selectedArtist || !selectedDate || !selectedTime) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    setPredictLoading(true);
    try {
      // Fetch customer selected services
      const customerSelectedResponse = await api.get(`/odata/customerSelected?$filter=id eq ${booking.CustomerSelectedId}&$select=id&$expand=nailDesignServiceSelecteds($select=nailDesignServiceId;$expand=nailDesignService($select=id,serviceId,naildesignId;$expand=service($select=name,description,price,averageDuration),naildesign($select=designId,nailPosition,isLeft,imageUrl)))`);
      const customerSelectedData = customerSelectedResponse.data.value[0];
      console.log("customerSelectedData", customerSelectedData);
      console.log("selectedArtist", selectedArtist);

      // Predict completion time
      const predictedTime = await predictCompletionTime(customerSelectedData, selectedArtist);
      console.log("predictedTime", predictedTime);

      const updatedBooking = {
        ServiceDate: selectedDate,
        StartTime: selectedTime,
        ArtistId: selectedArtist.ArtistId,
        StoreId: selectedStore.ID,
        CustomerSelectedId: booking.CustomerSelectedId,
        EstimateDuration: predictedTime.toString()
      };

      onSave(updatedBooking);
    } catch (error) {
      console.error("Error saving booking:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin đặt lịch");
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.bottomSheetOverlay}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHandle} />
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Chỉnh sửa đặt lịch</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bottomSheetBody} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="event" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Chọn ngày</Text>
              </View>
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
                  markedDates={{
                    [selectedDate]: { selected: true, selectedColor: colors.fifth }
                  }}
                  theme={{
                    selectedDayBackgroundColor: colors.fifth,
                    todayTextColor: colors.fifth,
                    arrowColor: colors.fifth
                  }}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="access-time" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Chọn giờ</Text>
              </View>
              <View style={styles.timeContainer}>
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = i + 8;
                  const time = `${hour.toString().padStart(2, "0")}:00`;
                  return (
                    <TouchableOpacity key={time} style={[styles.timeSlot, selectedTime === time && styles.selectedTime]} onPress={() => setSelectedTime(time)}>
                      <MaterialIcons name="access-time" size={16} color={selectedTime === time ? "#fff" : colors.fifth} />
                      <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>{time}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="store" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Chọn cửa hàng</Text>
              </View>
              <View style={styles.storeListContainer}>
                {stores.map((item) => (
                  <TouchableOpacity key={item.ID} style={[styles.storeCard, selectedStore?.ID === item.ID && styles.selectedStoreCard]} onPress={() => setSelectedStore(item)}>
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName} numberOfLines={1}>
                        {item.Address}
                      </Text>
                      <Text style={styles.storeDescription} numberOfLines={2}>
                        {item.Description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="person" size={20} color={colors.fifth} />
                <Text style={styles.sectionTitle}>Chọn artist</Text>
              </View>
              {loading ? (
                <ActivityIndicator size="large" color={colors.fifth} />
              ) : (
                <View style={styles.artistListContainer}>
                  {artists.map((item) => (
                    <TouchableOpacity key={item.ArtistId} style={[styles.artistCard, selectedArtist?.ArtistId === item.ArtistId && styles.selectedArtistCard]} onPress={() => setSelectedArtist(item)}>
                      <Image source={{ uri: item.Artist.User.ImageUrl }} style={styles.artistImage} />
                      <View style={styles.artistInfo}>
                        <Text style={styles.artistName}>{item.Artist.User.FullName}</Text>
                        <View style={styles.artistDetails}>
                          <View style={styles.artistDetailItem}>
                            <MaterialIcons name="star" size={16} color={colors.fifth} />
                            <Text style={styles.artistDetailText}>{item.Artist.Level}</Text>
                          </View>
                          <View style={styles.artistDetailItem}>
                            <MaterialIcons name="work" size={16} color={colors.fifth} />
                            <Text style={styles.artistDetailText}>{item.Artist.YearsOfExperience} năm kinh nghiệm</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.bottomSheetFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading || predictLoading}>
              {predictLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const FeedbackModal: React.FC<{
  booking: Booking;
  onClose: () => void;
  onSubmit: (feedbacks: Feedback[]) => void;
}> = ({ booking, onClose, onSubmit }) => {
  const [artistFeedback, setArtistFeedback] = useState<Feedback>({
    FeedbackType: 1,
    Rating: 5,
    Content: "",
    TypeId: booking.ArtistId || "",
    BookingId: booking.ID,
    FeedbackImages: []
  });

  const [designFeedbacks, setDesignFeedbacks] = useState<Feedback[]>(
    booking.services?.map(service => ({
    FeedbackType: 2,
    Rating: 5,
    Content: "",
      TypeId: service.designId || "",
      BookingId: booking.ID,
      FeedbackImages: []
    })) || []
  );

  const [storeFeedback, setStoreFeedback] = useState<Feedback>({
    FeedbackType: 3,
    Rating: 5,
    Content: "",
    TypeId: booking?.store?.ID || "",
    BookingId: booking.ID,
    FeedbackImages: []
  });

  const [selectedImages, setSelectedImages] = useState<{ [key: string]: Feedback['FeedbackImages'] }>({
    artist: [],
    store: []
  });

  const handleDesignFeedbackChange = (index: number, feedback: Feedback) => {
    const newFeedbacks = [...designFeedbacks];
    newFeedbacks[index] = feedback;
    setDesignFeedbacks(newFeedbacks);
  };

  const pickImage = async (type: string) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const newImage = {
          newImage: selectedImage.uri,
          ImageUrl: selectedImage.uri,
          mediaType: 0,
          numerialOrder: selectedImages[type]?.length || 0
        };

        setSelectedImages(prev => ({
          ...prev,
          [type]: [...(prev[type] || []), newImage]
        }));

        // Update the corresponding feedback with the new image
        if (type === 'artist') {
          setArtistFeedback(prev => ({
            ...prev,
            FeedbackImages: [...(prev.FeedbackImages || []), newImage]
          }));
        } else if (type === 'store') {
          setStoreFeedback(prev => ({
            ...prev,
            FeedbackImages: [...(prev.FeedbackImages || []), newImage]
          }));
        } else if (type.startsWith('design_')) {
          const index = parseInt(type.split('_')[1]);
          const newFeedbacks = [...designFeedbacks];
          newFeedbacks[index] = {
            ...newFeedbacks[index],
            FeedbackImages: [...(newFeedbacks[index].FeedbackImages || []), newImage]
          };
          setDesignFeedbacks(newFeedbacks);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const removeImage = (type: string, index: number) => {
    setSelectedImages(prev => {
      const newImages = [...(prev[type] || [])];
      newImages.splice(index, 1);
      return {
        ...prev,
        [type]: newImages
      };
    });

    // Update the corresponding feedback
    if (type === 'artist') {
      setArtistFeedback(prev => ({
        ...prev,
        FeedbackImages: prev.FeedbackImages?.filter((_, i) => i !== index)
      }));
    } else if (type === 'store') {
      setStoreFeedback(prev => ({
        ...prev,
        FeedbackImages: prev.FeedbackImages?.filter((_, i) => i !== index)
      }));
    } else if (type.startsWith('design_')) {
      const designIndex = parseInt(type.split('_')[1]);
      const newFeedbacks = [...designFeedbacks];
      newFeedbacks[designIndex] = {
        ...newFeedbacks[designIndex],
        FeedbackImages: newFeedbacks[designIndex].FeedbackImages?.filter((_, i) => i !== index)
      };
      setDesignFeedbacks(newFeedbacks);
    }
  };

  const handleSubmit = () => {
    const allFeedbacks = [
      artistFeedback,
      ...designFeedbacks,
      storeFeedback
    ];
    onSubmit(allFeedbacks);
    onClose();
  };

  const renderFeedbackSection = (title: string, feedback: Feedback, setFeedback: (f: Feedback) => void, imageUrl?: string, name?: string, type?: string) => (
    <View key={`feedback-section-${type}`} style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.feedbackHeader}>
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.feedbackImage} 
            />
          )}
          <View style={styles.feedbackTitleContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {name && <Text style={styles.feedbackName}>{name}</Text>}
          </View>
        </View>
      </View>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={`star-${star}`} onPress={() => setFeedback({ ...feedback, Rating: star })}>
            <MaterialIcons name={star <= feedback.Rating ? "star" : "star-border"} size={32} color={colors.fifth} />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput 
        style={styles.feedbackInput} 
        placeholder={`Nhập nhận xét về ${title.toLowerCase()}...`} 
        multiline 
        numberOfLines={4} 
        value={feedback.Content} 
        onChangeText={(text) => setFeedback({ ...feedback, Content: text })} 
      />
      
      {/* Image Upload Section */}
      <View style={styles.imageUploadSection}>
        <Text style={styles.imageUploadLabel}>Thêm hình ảnh (tối đa 5 ảnh)</Text>
        <View style={styles.imagePreviewContainer}>
          {feedback.FeedbackImages?.map((image, index) => (
            <View key={`image-${index}`} style={styles.imagePreviewItem}>
              <Image source={{ uri: image.ImageUrl }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(type || '', index)}
              >
                <MaterialIcons name="close" size={20} color={colors.fifth} />
              </TouchableOpacity>
            </View>
          ))}
          {(feedback.FeedbackImages?.length || 0) < 5 && (
            <TouchableOpacity 
              style={styles.addImageButton}
              onPress={() => pickImage(type || '')}
            >
              <MaterialIcons name="add" size={24} color={colors.fifth} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.bottomSheetOverlay}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHandle} />
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Đánh giá</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bottomSheetBody}>
            {renderFeedbackSection(
              "Nghệ sĩ", 
              artistFeedback, 
              setArtistFeedback,
              booking.artistName ? `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/User/GetImage?userId=${booking.ArtistId}` : undefined,
              booking.artistName,
              'artist'
            )}
            
            {booking.services?.map((service, index) => {
              const uniqueKey = `design_${service.designId || index}`;
              return renderFeedbackSection(
                `Mẫu nail ${index + 1}`, 
                designFeedbacks[index], 
                (feedback) => handleDesignFeedbackChange(index, feedback),
                service.designDetails?.Medias[0]?.ImageUrl,
                service.designDetails?.Name,
                uniqueKey
              );
            })}
            
            {renderFeedbackSection(
              "Cửa hàng", 
              storeFeedback, 
              setStoreFeedback,
              booking?.store?.ImageUrl,
              booking?.store?.Address,
              'store'
            )}
          </ScrollView>

          <View style={styles.bottomSheetFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <MaterialIcons name="send" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DeleteReasonModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isDeleting?: boolean;
}> = ({ visible, onClose, onConfirm, isDeleting }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do hủy đặt lịch');
      return;
    }
    onConfirm(reason);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lý do hủy đặt lịch</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do hủy đặt lịch..."
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const BookingDetails: React.FC<{
  booking: Booking;
  onClose: () => void;
  onRefresh: (userId: string) => void;
  userId: string;
}> = ({ booking, onClose, onRefresh, userId }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmitFeedback = async (feedbacks: Feedback[]) => {
    try {
      console.log("Sending feedbacks:", JSON.stringify(feedbacks, null, 2));

      // Send artist feedback
      if (feedbacks[0].TypeId) {
        const artistFormData = new FormData();
        artistFormData.append("FeedbackType", "1");
        artistFormData.append("Rating", feedbacks[0].Rating.toString());
        artistFormData.append("Content", feedbacks[0].Content);
        artistFormData.append("TypeId", feedbacks[0].TypeId);
        artistFormData.append("BookingId", feedbacks[0].BookingId || "");
        
        // Add images to formData
        feedbacks[0].FeedbackImages?.forEach((image, index) => {
          artistFormData.append(`FeedbackImages[${index}].newImage`, {
            uri: image.newImage,
            type: 'image/jpeg',
            name: `feedback_image_${index}.jpg`
          } as any);
          artistFormData.append(`FeedbackImages[${index}].mediaType`, image.mediaType.toString());
          artistFormData.append(`FeedbackImages[${index}].numerialOrder`, image.numerialOrder.toString());
        });

        await api.post("/api/Feedback", artistFormData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }

      // Send design feedbacks
      for (const feedback of feedbacks.slice(1, -1)) {
        if (feedback.TypeId) {
        const designFormData = new FormData();
        designFormData.append("FeedbackType", "2");
          designFormData.append("Rating", feedback.Rating.toString());
          designFormData.append("Content", feedback.Content);
          designFormData.append("TypeId", feedback.TypeId);
          designFormData.append("BookingId", feedback.BookingId || "");
          
          // Add images to formData
          feedback.FeedbackImages?.forEach((image, index) => {
            designFormData.append(`FeedbackImages[${index}].newImage`, {
              uri: image.newImage,
              type: 'image/jpeg',
              name: `feedback_image_${index}.jpg`
            } as any);
            designFormData.append(`FeedbackImages[${index}].mediaType`, image.mediaType.toString());
            designFormData.append(`FeedbackImages[${index}].numerialOrder`, image.numerialOrder.toString());
          });

        await api.post("/api/Feedback", designFormData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        }
      }

      // Send store feedback
      if (feedbacks[feedbacks.length - 1].TypeId) {
        const storeFormData = new FormData();
        storeFormData.append("FeedbackType", "3");
        storeFormData.append("Rating", feedbacks[feedbacks.length - 1].Rating.toString());
        storeFormData.append("Content", feedbacks[feedbacks.length - 1].Content);
        storeFormData.append("TypeId", feedbacks[feedbacks.length - 1].TypeId);
        storeFormData.append("BookingId", feedbacks[feedbacks.length - 1].BookingId || "");
        
        // Add images to formData
        feedbacks[feedbacks.length - 1].FeedbackImages?.forEach((image, index) => {
          storeFormData.append(`FeedbackImages[${index}].newImage`, {
            uri: image.newImage,
            type: 'image/jpeg',
            name: `feedback_image_${index}.jpg`
          } as any);
          storeFormData.append(`FeedbackImages[${index}].mediaType`, image.mediaType.toString());
          storeFormData.append(`FeedbackImages[${index}].numerialOrder`, image.numerialOrder.toString());
        });

        await api.post("/api/Feedback", storeFormData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }

      Alert.alert("Thành công", "Đã gửi đánh giá thành công");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá");
    }
  };

  const handleSave = async (updatedBooking: Partial<Booking>) => {
    try {
      const response = await api.put(`/api/Booking?id=${booking.ID}`, updatedBooking, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        Alert.alert("Thành công", "Đã cập nhật thông tin đặt lịch");
        setShowEditModal(false);
        onRefresh(userId); // Refresh the bookings list with userId
        onClose();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin đặt lịch");
    }
  };

  const handleDelete = async (reason: string) => {
    try {
      setIsDeleting(true);
      const formData = new FormData();
      formData.append('Status', '3');
      formData.append('Reason', reason);

      const response = await api.patch(
        `/api/Booking?id=${booking.ID}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Thành công", "Đã hủy đặt lịch");
        // Đóng modal trước khi refresh
        setShowDeleteModal(false);
        // Refresh danh sách booking
        await onRefresh(userId);
        // Đóng modal chi tiết
        onClose();
      }
    } catch (error: any) {
      console.error("Error deleting booking:", error.response?.data);
      Alert.alert("Lỗi", "Không thể hủy đặt lịch");
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("Rendering BookingDetails with booking:", booking);
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
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
            <MaterialIcons name="edit" size={24} color={colors.fifth} />
          </TouchableOpacity>
          {booking.Status === 3 ? (
            <TouchableOpacity style={styles.feedbackButton} onPress={() => setShowFeedbackModal(true)}>
              <MaterialIcons name="rate-review" size={24} color={colors.fifth} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteModal(true)}>
              <MaterialIcons name="delete" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.detailsCard}>
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <MaterialIcons name="event" size={24} color={colors.fifth} />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            <View style={[styles.statusContainer, { backgroundColor: getStatusColor(booking.Status) }]}>
              <Text style={styles.statusText}>{getStatusText(booking.Status)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="access-time" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Thời gian</Text>
            </View>
            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <MaterialIcons name="schedule" size={16} color="#666" />
                <Text style={styles.timeText}>
                  {formattedStartTime} - {formattedEndTime}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Nghệ sĩ</Text>
            </View>
            <View style={styles.artistContainer}>
              <MaterialIcons name="person-outline" size={20} color="#666" />
              <Text style={styles.artistText}>{booking.artistName || "Chưa xác định"}</Text>
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
                    <MaterialIcons name="spa" size={20} color="#666" />
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
                  <MaterialIcons name="location-on" size={16} color="#666" style={{ marginTop: 2 }} />
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

      {showEditModal && <EditBookingModal booking={booking} onClose={() => setShowEditModal(false)} onSave={handleSave} />}
      {showFeedbackModal && <FeedbackModal booking={booking} onClose={() => setShowFeedbackModal(false)} onSubmit={handleSubmitFeedback} />}
      {showDeleteModal && (
        <DeleteReasonModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </View>
  );
};

export default function FifthScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

  const fetchArtist = async (artistId: string) => {
    try {
      const response = await api.get(`/odata/artistStore?
$filter=id eq ${artistId}
&$select=artistId,storeId,workingDate,endTime,startTime
&$expand=store($select=id)
,artist($select=yearsOfExperience,level,id,averageRating
;$expand=user($select=fullName,imageUrl))`);
      console.log("response", response.data.value[0]);

      return response.data.value;
    } catch (error) {
      console.error("Error fetching artist:", error);
      return null;
    }
  };

  const fetchStore = async (storeId: string) => {
    try {
      console.log("Fetching store with ID:", storeId);
      const response = await api.get(`/odata/store?$filter=id eq ${storeId}&$select=id,description,address`);
      console.log("Store API response:", response.data);
      return response.data.value[0];
    } catch (error) {
      console.error("Error fetching store:", error);
      return null;
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

      // Get unique designIds
      const uniqueDesignIds = [...new Set(services.map((item: CartItem) => item.NailDesignService.NailDesign.DesignId))];

      // Fetch design details for each unique designId
      const designPromises = uniqueDesignIds.map((designId) => api.get(`/odata/design?$filter=Id eq ${designId}&$select=id,name&$expand=medias($top=1;$orderby=numerialOrder asc;$select=imageUrl,mediaType)`));

      const designResponses = await Promise.all(designPromises);
      const designDetails = designResponses.reduce((acc: { [key: string]: NailDesign }, response) => {
        if (response.data.value && response.data.value.length > 0) {
          acc[response.data.value[0].ID] = response.data.value[0];
        }
        return acc;
      }, {});

      // Group services by designId
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

        // Fetch additional data for each booking
        const bookingsWithDetails = await Promise.all(
          allBookings.map(async (booking: Booking) => {
            const [artist, services] = await Promise.all([fetchArtist(booking.ArtistStoreId), fetchServices(booking.CustomerSelectedId)]);
            console.log("Artist data:", artist);
            const artistName = artist[0]?.Artist?.User?.FullName;
            const artistId = artist[0]?.Artist?.ID;
            console.log("Artist ID:", artistId);
            const storeId = artist[0]?.Store?.ID;
            console.log("Store ID from artist:", storeId);
            const store = storeId ? await fetchStore(storeId) : null;
            console.log("Store data:", store);

            return {
              ...booking,
              artistName,
              artistId,
              services,
              store
            };
          })
        );

        console.log("Final bookings with details:", bookingsWithDetails);
        setBookings(bookingsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (selectedBooking) {
    return <BookingDetails booking={selectedBooking} onClose={() => setSelectedBooking(null)} onRefresh={fetchBookings} userId={userId || ""} />;
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bookings found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList data={bookings.sort((a, b) => new Date(b.LastModifiedAt).getTime() - new Date(a.LastModifiedAt).getTime())} keyExtractor={(item) => item.ID} renderItem={({ item }) => <BookingCard booking={item} onPress={() => setSelectedBooking(item)} />} contentContainerStyle={styles.listContainer} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333"
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center"
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  amountContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  amountText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333"
  },
  closeButton: {
    padding: 8
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
  artistContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8
  },
  artistText: {
    fontSize: 16,
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
  storeContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8
  },
  storeInfo: {
    gap: 8
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4
  },
  storeDetail: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  storeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  bottomSheetContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%"
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333"
  },
  bottomSheetBody: {
    padding: 16
  },
  bottomSheetFooter: {
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
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.fifth
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600"
  },
  storeListContainer: {
    gap: 8
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent"
  },
  selectedStoreCard: {
    backgroundColor: colors.fifth + "20",
    borderColor: colors.fifth
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12
  },
  storeDescription: {
    fontSize: 14,
    color: "#666"
  },
  artistListContainer: {
    gap: 8
  },
  artistCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent"
  },
  selectedArtistCard: {
    backgroundColor: colors.fifth + "20",
    borderColor: colors.fifth
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  artistInfo: {
    flex: 1,
    marginRight: 12
  },
  artistName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4
  },
  artistDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  artistDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  artistDetailText: {
    fontSize: 12,
    color: "#666"
  },
  headerActions: {
    flexDirection: "row",
    gap: 12
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5"
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginBottom: 12
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: "31%",
    minWidth: 0
  },
  selectedTime: {
    backgroundColor: colors.fifth
  },
  selectedTimeText: {
    color: "#fff"
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FF3B3020",
    marginRight: 8
  },
  feedbackButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginRight: 8
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top"
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  feedbackImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  feedbackTitleContainer: {
    flex: 1
  },
  feedbackName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4
  },
  imageUploadSection: {
    marginTop: 16,
    marginBottom: 8
  },
  imageUploadLabel: {
    fontSize: 14,
    color: colors.eigth,
    marginBottom: 8
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  imagePreviewItem: {
    position: 'relative'
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.sixth,
    borderRadius: 10,
    padding: 2
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.fifth,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
