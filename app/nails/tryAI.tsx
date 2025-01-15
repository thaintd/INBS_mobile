import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null); // Thêm state để lưu ảnh

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws");
    setWs(socket);

    socket.onmessage = (event) => {
      const img = `data:image/jpeg;base64,${event.data}`; // Tạo URI ảnh từ dữ liệu base64
      setImageUri(img); // Lưu ảnh vào state
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleCameraPermission = async () => {
    if (!permission || !permission.granted) {
      await requestPermission();
    }
  };

  useEffect(() => {
    handleCameraPermission();
  }, [permission]);

  const sendFrame = async () => {
    if (ws) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true
      });
      ws.send(photo.base64); // Gửi khung hình tới server
    }
  };

  useEffect(() => {
    const interval = setInterval(sendFrame, 200); // Gửi khung hình mỗi 200ms (~5 FPS)
    return () => clearInterval(interval);
  }, [ws]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.button}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />} {/* Hiển thị ảnh */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  message: {
    textAlign: "center",
    paddingBottom: 10
  },
  camera: {
    flex: 1
  },
  image: {
    width: "100%",
    height: "auto",
    position: "absolute", // Đặt ảnh lên trên camera
    top: 0,
    left: 0
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 5
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black"
  }
});
