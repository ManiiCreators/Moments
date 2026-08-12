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

export default function Followers({ route, navigation }) {
  const { user } = route.params;

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, []);

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

  const renderFollower = ({ item }) => {
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
        <Text style={styles.loadingText}>Loading followers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Followers</Text>

      {followers.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No followers yet.</Text>
        </View>
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={renderFollower}
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