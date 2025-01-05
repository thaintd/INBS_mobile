import React from "react";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import customTheme from "@/assets/colors/customTheme";
import { useAuth } from "@/hooks/useAuth";

const theme = {
  ...DefaultTheme,
  ...customTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...customTheme.colors
  },
  fonts: {
    ...DefaultTheme.fonts
  }
};

export default function RootLayout() {
  const { isAuthenticated } = useAuth();
  console.log("isAuthenticated", isAuthenticated);

  return (
    <ThemeProvider value={theme}>
      <Stack
        screenOptions={{
          headerShown: false // Ẩn header mặc định của React Navigation
        }}
      />
    </ThemeProvider>
  );
}
