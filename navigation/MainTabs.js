import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Home from "../screens/Home";
import MomentHome from "../screens/MomentHome";
import CreateImpact from "../screens/CreateImpact";
import CommunityHome from "../screens/CommunityHome";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111111",
        tabBarInactiveTintColor: "#888888",
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />

      <Tab.Screen
        name="Moments"
        component={MomentHome}
        options={{
          tabBarIcon: () => <Text>✨</Text>,
        }}
      />

      <Tab.Screen
        name="Impact"
        component={CreateImpact}
        options={{
          tabBarIcon: () => <Text>❤️</Text>,
        }}
      />

      <Tab.Screen
        name="Community"
        component={CommunityHome}
        options={{
          tabBarIcon: () => <Text>🤝</Text>,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}