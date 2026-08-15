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
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";

export default function SavedMoments({ navigation }) {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      setLoading(true);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setSavedPosts([]);
        return;
      }

      const querySnapshot = await getDocs(
        collection(db, "posts")
      );

      const saved = [];

      for (const postDoc of querySnapshot.docs) {
        const postData = postDoc.data();

        const savedBy = postData.savedBy || [];

        if (savedBy.includes(currentUser.uid)) {
          let userName = "Unknown User";
          let userPhoto = null;

          if (postData.userId) {
            const userSnap = await getDoc(
              doc(db, "users", postData.userId)
            );

            if (userSnap.exists()) {
              const userData = userSnap.data();

              userName = userData.name || "Unknown User";
              userPhoto = userData.photoURL || null;
            }
          }

          saved.push({
            id: postDoc.id,
            ...postData,
            userName,
            userPhoto,
          });
        }
      }

      setSavedPosts(saved);
    } catch (error) {
      console.log("LOAD SAVED POSTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const unsavePost = async (postId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please login first!");
        return;
      }

      await updateDoc(doc(db, "posts", postId), {
        savedBy: arrayRemove(currentUser.uid),
      });

      setSavedPosts((prev) =>
        prev.filter((post) => post.id !== postId)
      );
    } catch (error) {
      console.log("UNSAVE ERROR:", error);
      alert("Unable to unsave Moment.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading Saved Moments...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔖 Saved Moments</Text>

      {savedPosts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            🔖 No Saved Moments
          </Text>

          <Text style={styles.emptyText}>
            Save a Moment from your feed and it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              
              {/* USER HEADER */}
              <View style={styles.userRow}>
                <Image
                  source={
                    item.userPhoto
                      ? { uri: item.userPhoto }
                      : require("../assets/icon.png")
                  }
                  style={styles.profileImage}
                />

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {item.userName}
                  </Text>

                  <Text style={styles.subtitle}>
                    Moments
                  </Text>
                </View>
              </View>

              {/* CAPTION */}
              {item.caption ? (
                <Text style={styles.caption}>
                  {item.caption}
                </Text>
              ) : null}

              {/* IMAGE */}
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ) : null}

              {/* UNSAVE */}
              <TouchableOpacity
                onPress={() => unsavePost(item.id)}
                style={styles.unsaveButton}
              >
                <Text style={styles.unsaveText}>
                  🔖 Remove from Saved
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 5,
  },

  card: {
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    elevation: 3,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  caption: {
    fontSize: 16,
    color: "#222",
    paddingHorizontal: 15,
    marginBottom: 8,
    lineHeight: 22,
  },

  postImage: {
    width: "100%",
    height: 300,
  },

  unsaveButton: {
    alignSelf: "flex-end",
    backgroundColor: "#fff3cd",
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 10,
  },

  unsaveText: {
    fontSize: 15,
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },
});