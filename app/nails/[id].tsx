import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Animated, ActivityIndicator, TextInput, Alert, Modal } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import colors from "@/assets/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { designService } from "@/services/nailDesign";
import type { NailDesignID } from "@/types/nailDesign";
import type { NailDesign } from "@/types/nailDesign";
import { customerService } from "@/services/customerSelected";
import api from "@/lib/api";
import formatVND from "@/lib/formatVND";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

const getFingerName = (position: number) => {
  switch (position) {
    case 0:
      return "Ngón cái";
    case 1:
      return "Ngón trỏ";
    case 2:
      return "Ngón giữa";
    case 3:
      return "Ngón áp út";
    case 4:
      return "Ngón út";
    default:
      return `Ngón ${position + 1}`;
  }
};

const AccordionItem = ({ title, children, isExpanded, onToggle, imageUrl }) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [isExpanded]);

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
        <View style={styles.accordionHeaderContent}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: imageUrl }} style={styles.headerImage} />
            <Text style={styles.accordionTitle}>{title}</Text>
          </View>
          <Ionicons name={isExpanded ? "chevron-down" : "chevron-forward"} size={20} color={colors.eigth} />
        </View>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.accordionContent,
          {
            maxHeight: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 500]
            })
          }
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

interface FeedbackImage {
  newImage: string;
  ImageUrl: string;
  mediaType: number;
  numerialOrder: number;
}

interface Feedback {
  ID: string;
  Rating: number;
  Content: string;
  CustomerId: string;
  LastModifiedAt: string;
  FeedbackImages: FeedbackImage[];
  Customer: {
    ID: string;
    User: {
      FullName: string;
      ImageUrl: string;
    };
  };
}

export default function ServiceDetail() {
  const [design, setDesign] = useState<NailDesignID>();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedTab, setSelectedTab] = useState<'single' | 'all'>('single');
  const [selectedServices, setSelectedServices] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSelectingCombo, setIsSelectingCombo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartAnimation] = useState(new Animated.Value(1));
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const displayedFeedbacks = showAllReviews ? feedbacks : feedbacks.slice(0, 2);
  const [selectedImages, setSelectedImages] = useState<FeedbackImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<FeedbackImage[]>([]);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [showEditFeedbackModal, setShowEditFeedbackModal] = useState(false);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState<{ [key: string]: boolean }>({});
  
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const toggleAccordion = (position: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

  const handleSelectPosition = (item) => {
    setSelectedServices(item?.nailDesignServices);
  };

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

  const addToCart = async (serviceId: string) => {
    try {
      setLoadingButtons(prev => ({ ...prev, [serviceId]: true }));
      
      // Check if the service is already in the cart
      const userId = await AsyncStorage.getItem("userID");
      if (!userId) return;

      const cartResponse = await api.get(`/odata/cart?$filter=customerId eq ${userId} and naildesignserviceId eq ${serviceId} &$select=nailDesignServiceId`);
      if (cartResponse.data.value.length > 0) {
        alert("Dịch vụ này đã có trong giỏ hàng.");
        return;
      }

      const response = await api.post("api/Cart", { NailDesignServiceId: serviceId });
      console.log("Added to cart:", response.data);

      // Animate cart icon
      Animated.sequence([
        Animated.timing(cartAnimation, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(cartAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();

      // Update cart count
      getCartCount();

      // Show success message
      alert("Service added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add service to cart.");
    } finally {
      setLoadingButtons(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const openWebPage = () => {
    const url = "https://192.168.199.92:5173/"; // Thay bằng URL trang web của bạn
    Linking.openURL(url);
  };

  const pickImage = async () => {
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
        const newImage: FeedbackImage = {
          newImage: selectedImage.uri,
          ImageUrl: selectedImage.uri,
          mediaType: 0,
          numerialOrder: selectedImages.length
        };
        setSelectedImages([...selectedImages, newImage]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (hasSubmittedFeedback) {
      Alert.alert("Thông báo", "Bạn đã đánh giá thiết kế này rồi.");
      return;
    }

    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("FeedbackType", "2");
      formData.append("Rating", rating.toString());
      formData.append("Content", comment);
      formData.append("TypeId", id as string);
      
      // Add images to formData
      selectedImages.forEach((image, index) => {
        formData.append(`FeedbackImages[${index}].newImage`, {
          uri: image.newImage,
          type: 'image/jpeg',
          name: `feedback_image_${index}.jpg`
        } as any);
        formData.append(`FeedbackImages[${index}].mediaType`, image.mediaType.toString());
        formData.append(`FeedbackImages[${index}].numerialOrder`, image.numerialOrder.toString());
      });

      await api.post("/api/Feedback", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Refresh feedbacks
      const response = await api.get(`/odata/Feedback?$orderby=lastModifiedAt desc&$filter=typeId eq ${id}&$select=id,rating,content,customerId,lastModifiedAt&$expand=customer($select=id;$expand=user($select=fullName,imageUrl))&$expand=feedbackImages($select=imageUrl)`);
      setFeedbacks(response.data.value);
      setHasSubmittedFeedback(true);

      // Reset form
      setComment("");
      setRating(5);
      setSelectedImages([]);
      alert("Đã gửi đánh giá thành công!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const userId = await AsyncStorage.getItem("userID");
        setCurrentUserId(userId);

        const response = await api.get(`/odata/Feedback?$orderby=lastModifiedAt desc&$filter=typeId eq ${id}&$select=id,rating,content,customerId,lastModifiedAt&$expand=customer($select=id;$expand=user($select=fullName,imageUrl))&$expand=feedbackImages($select=imageUrl)`);
        console.log("Fetched feedbacks:", response.data.value);
        setFeedbacks(response.data.value);

        // Kiểm tra xem người dùng đã có feedback chưa
        if (userId) {
          const userFeedback = response.data.value.find(feedback => feedback.CustomerId === userId);
          setHasSubmittedFeedback(!!userFeedback);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };
    fetchFeedbacks();
  }, [id]);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setIsLoading(true);
        const res = await designService.getDesignById(id);
        setDesign(res);
        console.log("Fetched design:", res);
      } catch (error) {
        console.log("Error fetching design:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesign();
  }, [id]);

  const handleImagePress = (images: FeedbackImage[], index: number) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setSelectedImage(images[index].ImageUrl);
    setShowImageModal(true);
    translateX.setValue(0);
    scale.setValue(1);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentImages.length) return;

    const toValue = direction === 'left' ? -Dimensions.get('window').width : Dimensions.get('window').width;
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      let newIndex = currentImageIndex;
      if (direction === 'left') {
        newIndex = (currentImageIndex + 1) % currentImages.length;
      } else {
        newIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
      }

      setCurrentImageIndex(newIndex);
      setSelectedImage(currentImages[newIndex].ImageUrl);
      
      translateX.setValue(direction === 'left' ? Dimensions.get('window').width : -Dimensions.get('window').width);
      
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        handleSwipe('right');
      } else if (nativeEvent.translationX < -50) {
        handleSwipe('left');
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const renderFeedbackImages = (images: FeedbackImage[]) => {
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
      return (
        <TouchableOpacity 
          style={styles.singleImageContainer}
          onPress={() => handleImagePress(images, 0)}
        >
          <Image 
            source={{ uri: images[0].ImageUrl }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    if (images.length === 2) {
      return (
        <View style={styles.doubleImageContainer}>
          {images.map((image, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.doubleImageWrapper}
              onPress={() => handleImagePress(images, index)}
            >
              <Image 
                source={{ uri: image.ImageUrl }}
                style={styles.doubleImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.multipleImageContainer}>
        {images.slice(0, 4).map((image, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.multipleImageWrapper,
              index === 3 && images.length > 4 && styles.lastImageWrapper
            ]}
            onPress={() => handleImagePress(images, index)}
          >
            <Image 
              source={{ uri: image.ImageUrl }}
              style={styles.multipleImage}
              resizeMode="cover"
            />
            {index === 3 && images.length > 4 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{images.length - 4}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setShowEditFeedbackModal(true);
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa đánh giá này?", [
      {
        text: "Hủy",
        style: "cancel"
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setIsDeletingFeedback(true);
            console.log("Deleting feedback:", feedbackId);
            await api.delete(`/api/feedback?id=${feedbackId}`);
            
            // Refresh feedbacks
            const response = await api.get(`/odata/Feedback?$orderby=lastModifiedAt desc&$filter=typeId eq ${id}&$select=id,rating,content,customerId,lastModifiedAt&$expand=customer($select=id;$expand=user($select=fullName,imageUrl))&$expand=feedbackImages($select=imageUrl)`);
            setFeedbacks(response.data.value);
            
            // Reset hasSubmittedFeedback state
            const userId = await AsyncStorage.getItem("userID");
            if (userId) {
              const userFeedback = response.data.value.find(feedback => feedback.CustomerId === userId);
              setHasSubmittedFeedback(!!userFeedback);
            }
            
            Alert.alert("Thành công", "Đã xóa đánh giá");
          } catch (error) {
            console.error("Error deleting feedback:", error);
            Alert.alert("Lỗi", "Không thể xóa đánh giá");
          } finally {
            setIsDeletingFeedback(false);
          }
        }
      }
    ]);
  };

  const handleUpdateFeedback = async (updatedFeedback: Feedback) => {
    try {
      setIsUpdatingFeedback(true);
      const formData = new FormData();
      
      // Thêm các trường bắt buộc với kiểm tra giá trị
      if (updatedFeedback.Rating) {
        formData.append("Rating", updatedFeedback.Rating.toString());
      }
      if (updatedFeedback.Content) {
        formData.append("Content", updatedFeedback.Content);
      }
      if (id) {
        formData.append("TypeId", id.toString());
      }
      formData.append("FeedbackType", "2"); // 2 là feedback type cho nail design
      
      // Thêm hình ảnh vào formData
      if (updatedFeedback.FeedbackImages && updatedFeedback.FeedbackImages.length > 0) {
        updatedFeedback.FeedbackImages.forEach((image, index) => {
          if (image.newImage) {
            formData.append(`FeedbackImages[${index}].newImage`, {
              uri: image.newImage,
              type: 'image/jpeg',
              name: `feedback_image_${index}.jpg`
            } as any);
          } else if (image.ImageUrl) {
            formData.append(`FeedbackImages[${index}].ImageUrl`, image.ImageUrl);
          }
          if (image.mediaType !== undefined) {
            formData.append(`FeedbackImages[${index}].mediaType`, image.mediaType.toString());
          }
          if (image.numerialOrder !== undefined) {
            formData.append(`FeedbackImages[${index}].numerialOrder`, image.numerialOrder.toString());
          }
        });
      }

      console.log("Updating feedback with data:", {
        id: updatedFeedback.ID,
        rating: updatedFeedback.Rating,
        content: updatedFeedback.Content,
        typeId: id,
        feedbackType: "2",
        images: updatedFeedback.FeedbackImages
      });

      const response = await api.put(`/api/feedback?id=${updatedFeedback.ID}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Update response:", response.data);

      // Refresh feedbacks
      const feedbacksResponse = await api.get(`/odata/Feedback?$orderby=lastModifiedAt desc&$filter=typeId eq ${id}&$select=id,rating,content,customerId,lastModifiedAt&$expand=customer($select=id;$expand=user($select=fullName,imageUrl))&$expand=feedbackImages($select=imageUrl)`);
      setFeedbacks(feedbacksResponse.data.value);
      setShowEditFeedbackModal(false);
      setEditingFeedback(null);
      Alert.alert("Thành công", "Đã cập nhật đánh giá");
    } catch (error: any) {
      console.error("Error updating feedback:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể cập nhật đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsUpdatingFeedback(false);
    }
  };

  const selectCombo = async (serviceId: string) => {
    try {
      setLoadingButtons(prev => ({ ...prev, [serviceId]: true }));
      const userId = await AsyncStorage.getItem("userID");
      if (!userId) {
        alert("Vui lòng đăng nhập để tiếp tục");
        return;
      }

      const response = await api.post(`/api/CustomerSelected/Design?designId=${id}&serviceId=${serviceId}`);
      await AsyncStorage.setItem("customerSelected", JSON.stringify(response.data));
      router.push("/nails/schedule");
      console.log("Selected combo:", response.data);
      alert("Đã chọn combo thành công!");
    } catch (error: any) {
      console.error("Error selecting combo:", error.response?.data || error.message);
      alert("Không thể chọn combo. Vui lòng thử lại sau.");
    } finally {
      setLoadingButtons(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.fifth} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header đè lên carousel */}
      <View style={styles.headerAbsolute}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.fifth} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/nails/cart")} style={styles.favoriteButton}>
          <Animated.View style={{ transform: [{ scale: cartAnimation }] }}>
            <Ionicons name="cart-outline" size={24} color={colors.fifth} />
          </Animated.View>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {design?.Medias?.length > 0 && <Image source={{ uri: design.Medias[0].ImageUrl }} style={styles.carouselImage} resizeMode="cover" />}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.basicInfo}>
            <View style={styles.nameContainer}>
              <Ionicons name="color-palette" size={20} color={colors.fifth} />
              <Text style={styles.name}>{design?.Name}</Text>
              <TouchableOpacity style={styles.tryAIButton} onPress={() => openWebPage()}>
                <Ionicons name="scan-outline" size={20} color={colors.sixth} />
                <Text style={styles.tryAIText}>Try with AI</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingItem}>
                <Ionicons name="trending-up" size={16} color={colors.fifth} />
                <Text style={styles.ratingLabel}>Trend:</Text>
                <Text style={styles.ratingText}>{design?.TrendScore}</Text>
              </View>
              <View style={styles.ratingItem}>
                <Ionicons name="star" size={16} color={colors.fifth} />
                <Text style={styles.ratingLabel}>Rating:</Text>
                <Text style={styles.ratingText}>{design?.AverageRating.toFixed(1) || "0.0"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Mô tả</Text>
            </View>
            <Text style={styles.description}>{design?.Description}</Text>
          </View>

          {/* Service Section */}
          <View style={styles.descriptionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Dịch vụ</Text>
            </View>
            {design?.NailDesigns?.[0]?.nailDesignServices?.slice(0, 2).map((service, serviceIndex) => (
              <View key={serviceIndex} style={styles.generalServiceItem}>
                <View style={styles.generalServiceInfo}>
                  <Text style={styles.generalServiceName}>{service.service.Name}</Text>
                  <Text style={styles.generalServicePrice}>{formatVND(service.service.Price)}</Text>
                  <Text style={styles.generalServiceDescription}>{service.service.Description}</Text>
                </View>
                {service.service && service.service.ImageDescriptionUrl && (
                  <TouchableOpacity 
                    style={styles.imageContainer}
                    onPress={() => {
                      setSelectedImage(service.service.ImageDescriptionUrl);
                      setShowImageModal(true);
                    }}
                  >
                    <Image
                      source={{ uri: service.service.ImageDescriptionUrl }}
                      style={styles.generalServiceImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.descriptionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="hand-left" size={20} color={colors.fifth} />
              <Text style={styles.sectionTitle}>Vị trí</Text>
            </View>
            
            {/* Tab Selection */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, selectedTab === 'single' && styles.activeTabButton]}
                onPress={() => setSelectedTab('single')}
              >
                <Text style={[styles.tabText, selectedTab === 'single' && styles.activeTabText]}>Tùy chọn từng ngón</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, selectedTab === 'all' && styles.activeTabButton]}
                onPress={() => setSelectedTab('all')}
              >
                <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>Mẫu đồng bộ</Text>
              </TouchableOpacity>
            </View>

            {selectedTab === 'single' ? (
              design?.NailDesigns &&
              design.NailDesigns.map((item, index) => (
                <AccordionItem key={index} title={`${getFingerName(item?.NailPosition)} - ${item?.IsLeft ? "Tay trái" : "Tay phải"}`} isExpanded={expandedItems[item?.NailPosition] || false} onToggle={() => toggleAccordion(item?.NailPosition)} imageUrl={item?.ImageUrl}>
                  <View style={styles.positionContent}>
                    <View style={styles.servicesList}>
                      {item?.nailDesignServices?.map((service, serviceIndex) => (
                        <View key={serviceIndex} style={styles.positionServiceItem}>
                          <View style={styles.positionServiceInfo}>
                            <Text style={styles.positionServiceName}>{service.service.Name}</Text>
                            <Text style={styles.positionServicePrice}>{formatVND(service.service.Price)}</Text>
                           
                          </View>
                         
                          <TouchableOpacity 
                            style={[styles.actionButton, loadingButtons[service.ID] && styles.actionButtonDisabled]} 
                            onPress={() => addToCart(service.ID)} 
                            disabled={loadingButtons[service.ID]}
                          >
                            {loadingButtons[service.ID] ? (
                              <ActivityIndicator size="small" color={colors.sixth} />
                            ) : (
                              <>
                                <Ionicons name="cart-outline" size={18} style={styles.actionButtonIcon} />
                                <Text style={styles.actionButtonText}>Thêm vào giỏ</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                </AccordionItem>
              ))
            ) : (
              <View style={styles.allFingersContainer}>
                <View style={styles.servicesList}>
                  {design?.NailDesigns?.[0]?.nailDesignServices?.slice(0, 2).map((service, serviceIndex) => (
                    <View key={serviceIndex} style={styles.positionServiceItem}>
                      <View style={styles.positionServiceInfo}>
                        <Text style={styles.positionServiceName}>{service.service.Name}</Text>
                        <Text style={styles.positionServicePrice}>{formatVND(service.service.Price)}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.actionButton, loadingButtons[service.service.ID] && styles.actionButtonDisabled]} 
                        onPress={() => selectCombo(service.service.ID)} 
                        disabled={loadingButtons[service.service.ID]}
                      >
                        {loadingButtons[service.service.ID] ? (
                          <ActivityIndicator size="small" color={colors.sixth} />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle-outline" size={18} style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}>Chọn combo</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTitle}>Đánh giá</Text>
              <View style={styles.ratingSummary}>
                <View style={styles.ratingSummaryContent}>
                  <Ionicons name="star" size={20} color={colors.fifth} />
                  <Text style={styles.feedbackRatingText}>{feedbacks.length > 0 ? (feedbacks.reduce((acc, curr) => acc + curr.Rating, 0) / feedbacks.length).toFixed(1) : "0.0"}</Text>
                </View>
                <Text style={styles.ratingCount}>({feedbacks.length} đánh giá)</Text>
              </View>
            </View>

            {/* Feedback List */}
            <View style={styles.feedbackList}>
              {displayedFeedbacks.map((feedback) => (
                <View key={feedback.ID} style={styles.feedbackItem}>
                  <View style={styles.feedbackHeader}>
                    <Image source={{ uri: feedback.Customer.User.ImageUrl }} style={styles.userAvatar} />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{feedback.CustomerId === currentUserId ? "Bạn" : feedback.Customer.User.FullName}</Text>
                      <Text style={styles.feedbackDate}>{formatDate(feedback.LastModifiedAt)}</Text>
                    </View>
                    <View style={styles.feedbackRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name={star <= feedback.Rating ? "star" : "star-outline"} size={16} color={colors.fifth} />
                      ))}
                    </View>
                    {feedback.CustomerId === currentUserId && (
                      <View style={styles.feedbackActions}>
                        <TouchableOpacity 
                          onPress={() => handleDeleteFeedback(feedback.ID)}
                          disabled={isDeletingFeedback}
                        >
                          {isDeletingFeedback ? (
                            <ActivityIndicator size="small" color="#FF3B30" />
                          ) : (
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.feedbackContent}>{feedback.Content}</Text>
                  
                  {/* Feedback Images */}
                  {feedback.FeedbackImages && feedback.FeedbackImages.length > 0 && (
                    <View style={styles.feedbackImagesContainer}>
                      {renderFeedbackImages(feedback.FeedbackImages)}
                    </View>
                  )}
                </View>
              ))}
              {feedbacks.length > 2 && (
                <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllReviews(!showAllReviews)}>
                  <Text style={styles.showMoreText}>{showAllReviews ? "Thu gọn" : `Xem thêm ${feedbacks.length - 2} đánh giá`}</Text>
                  <Ionicons name={showAllReviews ? "chevron-up" : "chevron-down"} size={16} color={colors.fifth} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity 
          style={styles.fullImageModal}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <Image 
            source={{ uri: selectedImage || '' }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {/* Edit Feedback Modal */}
      <Modal
        visible={showEditFeedbackModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa đánh giá</Text>
              <TouchableOpacity onPress={() => setShowEditFeedbackModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {editingFeedback && (
                <>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity 
                        key={star} 
                        onPress={() => setEditingFeedback({...editingFeedback, Rating: star})}
                      >
                        <Ionicons 
                          name={star <= editingFeedback.Rating ? "star" : "star-outline"} 
                          size={32} 
                          color={colors.fifth} 
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput 
                    style={styles.commentInput} 
                    placeholder="Chia sẻ cảm nhận của bạn..." 
                    value={editingFeedback.Content}
                    onChangeText={(text) => setEditingFeedback({...editingFeedback, Content: text})}
                    multiline 
                    numberOfLines={4} 
                  />

                  {/* Image Upload Section */}
                  <View style={styles.imageUploadSection}>
                    <Text style={styles.imageUploadLabel}>Hình ảnh (tối đa 5 ảnh)</Text>
                    <View style={styles.imagePreviewContainer}>
                      {editingFeedback.FeedbackImages?.map((image, index) => (
                        <View key={index} style={styles.imagePreviewItem}>
                          <Image source={{ uri: image.ImageUrl }} style={styles.imagePreview} />
                          <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={() => {
                              const newImages = [...editingFeedback.FeedbackImages];
                              newImages.splice(index, 1);
                              setEditingFeedback({...editingFeedback, FeedbackImages: newImages});
                            }}
                          >
                            <Ionicons name="close-circle" size={20} color={colors.fifth} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {(editingFeedback.FeedbackImages?.length || 0) < 5 && (
                        <TouchableOpacity 
                          style={styles.addImageButton}
                          onPress={async () => {
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
                                  numerialOrder: editingFeedback.FeedbackImages?.length || 0
                                };
                                setEditingFeedback({
                                  ...editingFeedback,
                                  FeedbackImages: [...(editingFeedback.FeedbackImages || []), newImage]
                                });
                              }
                            } catch (error) {
                              console.error('Error picking image:', error);
                              Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
                            }
                          }}
                        >
                          <Ionicons name="add" size={24} color={colors.fifth} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.cancelButton, isUpdatingFeedback && styles.disabledButton]}
                onPress={() => setShowEditFeedbackModal(false)}
                disabled={isUpdatingFeedback}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, isUpdatingFeedback && styles.disabledButton]}
                onPress={() => editingFeedback && handleUpdateFeedback(editingFeedback)}
                disabled={isUpdatingFeedback}
              >
                {isUpdatingFeedback ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  servicesContainer: { marginTop: 20 },
  positionContainer: {
    marginBottom: 20
  },
  positionItem: {
    flexDirection: "row", // Bố cục hàng ngang (hình trái, chữ phải)
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#fff"
  },
  selectedPosition: {
    borderColor: colors.fifth, // Khi được chọn sẽ đổi màu viền
    borderWidth: 2
  },
  rowContainer: {
    flexDirection: "row", // Căn chỉnh ngang
    alignItems: "center"
  },
  positionImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10 // Khoảng cách giữa ảnh và text
  },
  positionText: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "bold"
  },
  container: {
    flex: 1,
    backgroundColor: colors.sixth
  },
  scrollView: {
    flex: 1
  },
  scrollViewContent: {
    flexGrow: 1
  },
  headerAbsolute: {
    top: 5,
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.third,
    justifyContent: "center",
    alignItems: "center"
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.third,
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
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
  },
  carouselContainer: {
    backgroundColor: colors.fourth
  },
  carouselImage: {
    width: "100%",
    height: 200
  },
  thumbnailContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: colors.third
  },
  thumbnailWrapper: {
    padding: 2,
    borderRadius: 8,
    backgroundColor: colors.fourth
  },
  activeThumbnailWrapper: {
    backgroundColor: colors.fifth
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6
  },
  activeThumbnail: {
    opacity: 0.8
  },
  content: {
    padding: 20
  },
  basicInfo: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap"
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.eigth,
    flex: 1
  },
  tryAIButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.fifth,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  tryAIText: {
    color: colors.sixth,
    fontSize: 14,
    fontWeight: "500"
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 16
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.eigth,
    fontWeight: "500"
  },
  ratingText: {
    fontSize: 14,
    color: colors.eigth
  },
  descriptionContainer: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8
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
    color: colors.eigth
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.eigth
  },
  occasionsContainer: {
    marginBottom: 24
  },
  occasionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  occasionTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${colors.fifth}10`,
    borderRadius: 20
  },
  occasionText: {
    fontSize: 14,
    color: colors.fifth
  },
  positionContent: {
    padding: 12
  },
  servicesList: {
    gap: 8
  },
  serviceItem: {
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
  },
  serviceInfo: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.eigth,
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    color: colors.fifth,
    fontWeight: "500",
    marginBottom: 12,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.eigth,
    lineHeight: 20,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    paddingHorizontal: 0,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.fifth,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4
  },
  addToCartText: {
    color: "#fff",
    fontSize: 13
  },
  accordionItem: {
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8
  },
  accordionHeader: {
    padding: 12
  },
  accordionHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12
  },
  accordionTitle: {
    fontSize: 15,
    color: colors.eigth,
    flex: 1
  },
  accordionContent: {
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "#eee"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.sixth
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.eigth,
    fontWeight: "500"
  },
  addToCartButtonDisabled: {
    opacity: 0.7
  },
  feedbackSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 4,
    borderRadius: 8
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.eigth
  },
  ratingSummary: {
    alignItems: "flex-end"
  },
  ratingSummaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  feedbackRatingText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.eigth
  },
  ratingCount: {
    fontSize: 14,
    color: "#666"
  },
  feedbackForm: {
    marginBottom: 24,
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8
  },
  feedbackRatingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.eigth,
    marginBottom: 12
  },
  starContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 16
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    marginBottom: 16
  },
  submitButton: {
    backgroundColor: colors.fifth,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  submitButtonDisabled: {
    opacity: 0.7
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  feedbackList: {
    gap: 16
  },
  feedbackItem: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.eigth,
    marginBottom: 4
  },
  feedbackDate: {
    fontSize: 12,
    color: "#666"
  },
  feedbackRating: {
    flexDirection: "row",
    gap: 4
  },
  feedbackContent: {
    fontSize: 14,
    color: colors.eigth,
    lineHeight: 20,
    marginTop: 12
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginTop: 8
  },
  showMoreText: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "500",
    marginRight: 4
  },
  imageUploadSection: {
    marginBottom: 16
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
  feedbackImagesContainer: {
    marginTop: 12,
  },
  singleImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },
  doubleImageContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  doubleImageWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  doubleImage: {
    width: '100%',
    height: '100%',
  },
  multipleImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  multipleImageWrapper: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  lastImageWrapper: {
    position: 'relative',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
  },
  multipleImage: {
    width: '100%',
    height: '100%',
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 'auto'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  modalBody: {
    padding: 16
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  disabledButton: {
    opacity: 0.5
  },
  cancelButton: {
    backgroundColor: colors.fifth,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  saveButton: {
    backgroundColor: colors.fifth,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  feedbackMessage: {
    fontSize: 16,
    color: colors.fifth,
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 16
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: colors.fifth,
  },
  tabText: {
    fontSize: 14,
    color: colors.eigth,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.sixth,
  },
  allFingersContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  fullImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  // General Service Styles
  generalServiceItem: {
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
  },
  generalServiceInfo: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  generalServiceName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.eigth,
    marginBottom: 8,
  },
  generalServicePrice: {
    fontSize: 16,
    color: colors.fifth,
    fontWeight: "500",
    marginBottom: 12,
  },
  generalServiceDescription: {
    fontSize: 14,
    color: colors.eigth,
    lineHeight: 20,
    marginBottom: 16,
  },
  generalServiceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },

  // Position Service Styles
  positionServiceItem: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  positionServiceInfo: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  positionServiceName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.eigth,
    marginBottom: 6,
  },
  positionServicePrice: {
    fontSize: 14,
    color: colors.fifth,
    fontWeight: "500",
    marginBottom: 8,
  },
  positionServiceDescription: {
    fontSize: 13,
    color: colors.eigth,
    lineHeight: 18,
    marginBottom: 12,
  },
  positionServiceImage: {
    width: '100%',
    height: 150,
    borderRadius: 6,
  },
  // Button Styles
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fifth,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonDisabled: {
    opacity: 0.7,
    backgroundColor: `${colors.fifth}80`,
  },
  actionButtonText: {
    color: colors.sixth,
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonIcon: {
    color: colors.sixth,
  },
});
