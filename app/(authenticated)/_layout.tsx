import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import colors from "@/assets/colors/colors";

const tabsData: { name: string; title: string; icon: "home" | "hand-left" | "person" | "heart" | "time" }[] = [
  { name: "home", title: "Home", icon: "home-outline" },
  { name: "fourth", title: "Nail", icon: "hand-left-outline" },
  { name: "profile", title: "Profile", icon: "person-outline" },
  { name: "favorite", title: "Favorite", icon: "heart-outline" },
  { name: "fifth", title: "Schedule", icon: "time-outline" }
];

export default function TabLayout() {
  const [selectedTab, setSelectedTab] = useState("home");

  const reorderedTabs = [...tabsData.filter((tab) => tab.name !== selectedTab)];
  reorderedTabs.splice(2, 0, tabsData.find((tab) => tab.name === selectedTab) || tabsData[0]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.fifth,
        tabBarInactiveTintColor: `${colors.eigth}`,
        tabBarLabelStyle: {
          fontSize: 12
        },
        tabBarStyle: {
          backgroundColor: colors.sixth,
          height: 55,
          paddingBottom: 10
        }
      }}
    >
      {reorderedTabs.map((tab, index) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarLabel: tab.title,
            tabBarIcon: ({ color, size }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selectedTab === tab.name ? colors.third : "transparent",
                  borderRadius: size,
                  padding: 10,
                  transform: selectedTab === tab.name ? [{ translateY: -size * 0.75 }] : [],
                  width: size * 2,
                  height: size * 2
                }}
              >
                <Ionicons name={tab.icon} size={size} color={selectedTab === tab.name ? colors.fifth : colors.eigth} />
              </View>
            )
          }}
          listeners={{
            tabPress: () => setSelectedTab(tab.name)
          }}
        />
      ))}
    </Tabs>
  );
}
