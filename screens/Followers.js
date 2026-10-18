import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Followers({ route, navigation }) {
const user = route?.params?.user || {
  id: auth.currentUser?.uid,
};

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  if (user?.id) {
    loadFollowers();
  } else {
    setFollowers([]);
    setLoading(false);
  }
}, [user?.id]);

  const loadFollowers = async () => {
    try {
      const userRef = doc(db, "users", user.id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setFollowers([]);
        return;
      }

      const userData = userSnap.data();
      const followerIds = userData.followers || [];

      const followerUsers = await Promise.all(
        followerIds.map(async (uid) => {
          const followerRef = doc(db, "users", uid);
          const followerSnap = await getDoc(followerRef);

          if (followerSnap.exists()) {
            return {
              id: uid,
              ...followerSnap.data(),
            };
          }

          return null;
        })
      );

      setFollowers(followerUsers.filter(Boolean));
    } catch (error) {
      console.log("Error loading followers:", error);
    } finally {
      setLoading(false);
    }
  };

  const openProfile = (person) => {
    navigation.navigate("UserProfile", {
      user: person,
    });
  };

  const renderFollower = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.82}
        onPress={() => openProfile(item)}
      >
        {/* Profile Image */}
        <View style={styles.avatarWrapper}>
          <Image
            source={
              item.photoURL
                ? { uri: item.photoURL }
                : require("../assets/icon.png")
            }
            style={styles.profileImage}
          />
        </View>

        {/* User Information */}
        <View style={styles.userInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || "Unknown User"}
          </Text>

          <Text style={styles.bio} numberOfLines={1}>
            {item.bio || "No bio yet"}
          </Text>
        </View>

        {/* Profile Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#A1A7B3"
          />
        </View>
      </TouchableOpacity>
    );
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8F9FC"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color="#1F2A44"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Followers</Text>
            <Text style={styles.headerSubtitle}>
              People following this profile
            </Text>
          </View>

          <View style={styles.headerRightSpace} />
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator
              size="small"
              color="#E83263"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading followers
          </Text>

          <Text style={styles.loadingSubtitle}>
            Please wait a moment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- MAIN SCREEN ---------------- */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FC"
      />

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={25}
            color="#1F2A44"
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Followers</Text>

          <Text style={styles.headerSubtitle}>
            {followers.length === 1
              ? "1 person follows this profile"
              : `${followers.length} people follow this profile`}
          </Text>
        </View>

        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>
            {followers.length}
          </Text>
        </View>
      </View>

      {/* ================= DIVIDER ================= */}

      <View style={styles.headerDivider} />

      {/* ================= EMPTY STATE ================= */}

      {followers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="people-outline"
              size={38}
              color="#E83263"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No followers yet
          </Text>

          <Text style={styles.emptySubtitle}>
            When people follow this profile,{"\n"}
            they will appear here.
          </Text>
        </View>
      ) : (
        /* ================= FOLLOWER LIST ================= */

        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={renderFollower}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },

  /* ================= HEADER ================= */

  header: {
    minHeight: 82,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#1F2A44",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2A44",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    color: "#8A91A0",
    fontWeight: "500",
  },

  headerRightSpace: {
    width: 44,
  },

  headerCount: {
    minWidth: 42,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#FDE8EF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCountText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#E83263",
  },

  headerDivider: {
    height: 1,
    backgroundColor: "#E9ECF2",
    marginHorizontal: 18,
  },

  /* ================= LIST ================= */

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },

  userCard: {
    minHeight: 82,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#EEF0F4",

    shadowColor: "#1F2A44",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 2,
  },

  /* ================= PROFILE IMAGE ================= */

  avatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2,
    backgroundColor: "#FDE8EF",
    alignItems: "center",
    justifyContent: "center",
  },

  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EEF0F4",
  },

  /* ================= USER INFO ================= */

  userInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A44",
    letterSpacing: -0.1,
  },

  bio: {
    marginTop: 5,
    fontSize: 13.5,
    color: "#7C8494",
    lineHeight: 18,
  },

  /* ================= ARROW ================= */

  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F8F9FC",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= LOADING ================= */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },

  loadingCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FDE8EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A44",
  },

  loadingSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#8A91A0",
  },

  /* ================= EMPTY ================= */

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 70,
  },

  emptyIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FDE8EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1F2A44",
  },

  emptySubtitle: {
    marginTop: 9,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#8A91A0",
  },
});