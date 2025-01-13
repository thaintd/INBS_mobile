import { Stack } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
import { useRouter, usePathname } from "expo-router";

export default function AuthLayout() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.third
        },
        headerTintColor: colors.fifth,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 24
        },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle-outline" size={32} color={colors.fifth} />
          </TouchableOpacity>
        )
      }}
    />
  );
}
