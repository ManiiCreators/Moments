import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "../screens/Home";
import MomentHome from "../screens/MomentHome";
import Impact from "../screens/Impact";
import CommunityHome from "../screens/CommunityHome";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: styles.tabBar,

        tabBarActiveTintColor: "#EF3D68",
        tabBarInactiveTintColor: "#8E8E93",

        tabBarLabelStyle: styles.label,

        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* MOMENTS */}
      <Tab.Screen
        name="Moments"
        component={MomentHome}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "sparkles" : "sparkles-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* IMPACT */}
      <Tab.Screen
        name="Impact"
        component={Impact}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.impactOuter}>
              <View
                style={[
                  styles.impactButton,
                  focused && styles.impactButtonActive,
                ]}
              >
                <Ionicons
                  name={focused ? "heart" : "heart-outline"}
                  size={29}
                  color="#FFFFFF"
                />
              </View>
            </View>
          ),
          tabBarLabelStyle: styles.impactLabel,
        }}
      />

      {/* COMMUNITY */}
      <Tab.Screen
        name="Community"
        component={CommunityHome}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={27}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  /* BOTTOM NAVIGATION BAR */

  tabBar: {
    height: 82,
    paddingTop: 8,
    paddingBottom: 10,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 0,

    elevation: 12,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: -4,
    },

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    overflow: "visible",
  },

  /* NAVIGATION LABEL */

  label: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  /* CENTER IMPACT BUTTON */

  impactOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    marginTop: -34,

    elevation: 12,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  /* PINK HEART BUTTON */

  impactButton: {
    width: 60,
    height: 60,
    borderRadius: 30,

    backgroundColor: "#EF3D68",

    justifyContent: "center",
    alignItems: "center",

    elevation: 6,
  },

  /* ACTIVE IMPACT */

  impactButtonActive: {
    transform: [{ scale: 1.04 }],
  },

  /* IMPACT LABEL */

  impactLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
});