import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import colors from "@/assets/colors/colors"; // Import colors

const tabsData: { name: string; title: string; icon: "home" | "list" | "person" | "heart" | "settings" }[] = [
  { name: "index", title: "Home", icon: "home" },
  { name: "fourth", title: "Fourth", icon: "list" },
  { name: "profile", title: "Profile", icon: "person" },
  { name: "favorite", title: "Favorite", icon: "heart" },
  { name: "fifth", title: "Fifth", icon: "settings" }
];

export default function TabLayout() {
  const [selectedTab, setSelectedTab] = useState("index");

  const reorderedTabs = [...tabsData.filter((tab) => tab.name !== selectedTab)];
  reorderedTabs.splice(2, 0, tabsData.find((tab) => tab.name === selectedTab) || tabsData[0]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {reorderedTabs.map((tab, index) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarLabel: "",
            tabBarIcon: ({ color, size }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selectedTab === tab.name ? colors.second : "transparent",
                  borderRadius: size,
                  padding: 10,
                  transform: selectedTab === tab.name ? [{ translateY: -size * 0.75 }] : [],
                  width: size * 2,
                  height: size * 2
                }}
              >
                <Ionicons name={tab.icon} size={size} color={selectedTab === tab.name ? colors.fifth : colors.fifth} />
              </View>
            ),
            tabBarStyle: {
              backgroundColor: colors.first
            }
          }}
          listeners={{
            tabPress: () => setSelectedTab(tab.name)
          }}
        />
      ))}
    </Tabs>
  );
}
