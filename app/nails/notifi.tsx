// import React, { useEffect, useState } from "react";
// import { View, Text, Button, Alert } from "react-native";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";

// // Cấu hình Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyAtAbV6sMft_doFAjrLp774VZWhEavz6MQ",
//   authDomain: "fir-realtime-database-49344.firebaseapp.com",
//   projectId: "fir-realtime-database-49344",
//   storageBucket: "fir-realtime-database-49344.appspot.com",
//   messagingSenderId: "423913316379",
//   appId: "1:423913316379:web:201871eb6ae9dd2a0198be"
// };

// export default function NotificationTest() {
//   const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

//   useEffect(() => {
//     registerForPushNotificationsAsync();
//   }, []);

//   async function registerForPushNotificationsAsync() {
//     if (!Device.isDevice) {
//       alert("Bạn phải chạy trên thiết bị thật để nhận thông báo!");
//       return;
//     }

//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       alert("Quyền thông báo bị từ chối!");
//       return;
//     }

//     // Lấy Expo Push Token (dùng cho Expo Server)
//     const token = (await Notifications.getExpoPushTokenAsync()).data;
//     setExpoPushToken(token);
//     console.log("Expo Push Token:", token);
//   }

//   // Xử lý thông báo khi ứng dụng đang chạy foreground
//   useEffect(() => {
//     const subscription = Notifications.addNotificationReceivedListener((notification) => {
//       Alert.alert("📩 Thông báo mới", notification.request.content.body || "Không có nội dung");
//     });

//     return () => subscription.remove();
//   }, []);

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text style={{ fontSize: 16, marginBottom: 10 }}>Expo Push Token:</Text>
//       <Text style={{ fontSize: 12, color: "blue" }}>{expoPushToken || "Đang lấy..."}</Text>
//       <Button title="Lấy lại Token" onPress={registerForPushNotificationsAsync} />
//     </View>
//   );
// }
