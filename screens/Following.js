import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Following({ route, navigation }) {
  const { user } = route.params;

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      const userRef = doc(db, "users", user.id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setFollowing([]);
        return;
      }

      const userData = userSnap.data();
      const followingIds = userData.following || [];

      const followingUsers = await Promise.all(
        followingIds.map(async (uid) => {
          const followingRef = doc(db, "users", uid);
          const followingSnap = await getDoc(followingRef);

          if (followingSnap.exists()) {
            return {
              id: uid,
              ...followingSnap.data(),
            };
          }

          return null;
        })
      );

      setFollowing(followingUsers.filter(Boolean));
    } catch (error) {
      console.log("Error loading following:", error);
    } finally {
      setLoading(false);
    }
  };

  const openProfile = (person) => {
    navigation.navigate("UserProfile", {
      user: person,
    });
  };

  const renderFollowing = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => openProfile(item)}
      >
        <Image
          source={
            item.photoURL
              ? { uri: item.photoURL }
              : require("../assets/icon.png")
          }
          style={styles.profileImage}
        />

        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name || "Unknown User"}</Text>

          <Text style={styles.bio} numberOfLines={1}>
            {item.bio || "No bio yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading following...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Following</Text>

      {following.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Not following anyone yet.</Text>
        </View>
      ) : (
        <FlatList
          data={following}
          keyExtractor={(item) => item.id}
          renderItem={renderFollowing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  userInfo: {
    marginLeft: 15,
    flex: 1,
  },

  name: {
    fontSize: 19,
    fontWeight: "bold",
  },

  bio: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  emptyText: {
    fontSize: 18,
    color: "#777",
  },
});