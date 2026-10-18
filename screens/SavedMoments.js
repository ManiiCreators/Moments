
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

export default function SavedMoments({ navigation }) {
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedImpacts, setSavedImpacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = async () => {
    try {
      setLoading(true);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setSavedPosts([]);
        setSavedImpacts([]);
        return;
      }

      // Load saved Moments (existing functionality)
      const postsSnapshot = await getDocs(
        collection(db, "posts")
      );

      const posts = [];

      for (const postDoc of postsSnapshot.docs) {
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

          posts.push({
            id: postDoc.id,
            ...postData,
            userName,
            userPhoto,
            itemType: "moment",
          });
        }
      }

      setSavedPosts(posts);

      // Load saved Impacts from each Impact's saves subcollection
      const impactsSnapshot = await getDocs(
        collection(db, "impacts")
      );

      const impacts = [];

      for (const impactDoc of impactsSnapshot.docs) {
        const saveRef = doc(
          db,
          "impacts",
          impactDoc.id,
          "saves",
          currentUser.uid
        );

        const saveSnap = await getDoc(saveRef);

        // A save document exists for this user
        if (saveSnap.exists()) {
          const impactData = impactDoc.data();

          impacts.push({
            id: impactDoc.id,
            ...impactData,
            itemType: "impact",
          });
        }
      }

      setSavedImpacts(impacts);
    } catch (error) {
      console.log("LOAD SAVED ITEMS ERROR:", error);
      Alert.alert(
        "Unable to load saved items",
        error.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const unsavePost = async (postId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Login required", "Please login first.");
        return;
      }

      await updateDoc(doc(db, "posts", postId), {
        savedBy: arrayRemove(currentUser.uid),
      });

      setSavedPosts((prev) =>
        prev.filter((post) => post.id !== postId)
      );
    } catch (error) {
      console.log("UNSAVE MOMENT ERROR:", error);
      Alert.alert("Unable to unsave Moment", error.message);
    }
  };

  const unsaveImpact = async (impactId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Login required", "Please login first.");
        return;
      }

      await deleteDoc(
        doc(
          db,
          "impacts",
          impactId,
          "saves",
          currentUser.uid
        )
      );

      setSavedImpacts((prev) =>
        prev.filter((impact) => impact.id !== impactId)
      );
    } catch (error) {
      console.log("UNSAVE IMPACT ERROR:", error);
      Alert.alert(
        "Unable to remove saved Impact",
        error.message || "Please try again."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E83263" />
        <Text style={styles.loadingText}>
          Loading Saved Moments...
        </Text>
      </View>
    );
  }

  const allSavedItems = [
    ...savedPosts,
    ...savedImpacts,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔖 Saved Moments</Text>

      {allSavedItems.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            🔖 No Saved Items
          </Text>
          <Text style={styles.emptyText}>
            Save a Moment or Impact and it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={allSavedItems}
          keyExtractor={(item) =>
            `${item.itemType}-${item.id}`
          }
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => {
            const isImpact = item.itemType === "impact";
            const displayName =
              item.userName || item.name || "Unknown User";
            const photo =
              item.userPhoto || item.photoURL || null;

            const caption = isImpact
              ? item.story || item.action || ""
              : item.caption || "";

            return (
              <View style={styles.card}>
                <View style={styles.userRow}>
                  <Image
                    source={
                      photo
                        ? { uri: photo }
                        : require("../assets/icon.png")
                    }
                    style={styles.profileImage}
                  />

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {displayName}
                    </Text>
                    <Text style={styles.subtitle}>
                      {isImpact ? "Community Impact" : "Moments"}
                    </Text>
                  </View>
                </View>

                {isImpact && item.category ? (
                  <Text style={styles.category}>
                    {item.category}
                  </Text>
                ) : null}

                {caption ? (
                  <Text style={styles.caption}>
                    {caption}
                  </Text>
                ) : null}

                {isImpact && item.action && item.story ? (
                  <Text style={styles.detail}>
                    Action: {item.action}
                  </Text>
                ) : null}

                {isImpact && item.location ? (
                  <Text style={styles.detail}>
                    📍 {item.location}
                  </Text>
                ) : null}

                {isImpact && item.peopleHelped ? (
                  <Text style={styles.detail}>
                    People helped: {item.peopleHelped}
                  </Text>
                ) : null}

                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() =>
                    isImpact
                      ? unsaveImpact(item.id)
                      : unsavePost(item.id)
                  }
                  style={styles.unsaveButton}
                >
                  <Text style={styles.unsaveText}>
                    🔖 Remove from Saved
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF9",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#263746",
    marginTop: 20,
    marginBottom: 5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E2DA",
    elevation: 3,
    paddingBottom: 8,
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
    backgroundColor: "#F2EDE7",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#263746",
  },
  subtitle: {
    fontSize: 13,
    color: "#8A8178",
    marginTop: 3,
  },
  category: {
    color: "#C42E58",
    fontWeight: "600",
    paddingHorizontal: 15,
    marginBottom: 7,
  },
  caption: {
    fontSize: 16,
    color: "#30343B",
    paddingHorizontal: 15,
    marginBottom: 8,
    lineHeight: 23,
  },
  detail: {
    fontSize: 14,
    color: "#656565",
    paddingHorizontal: 15,
    marginBottom: 7,
  },
  postImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#F2EDE7",
  },
  unsaveButton: {
    alignSelf: "flex-end",
    backgroundColor: "#FFF0F3",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 10,
  },
  unsaveText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C42E58",
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
    color: "#555555",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#263746",
  },
  emptyText: {
    fontSize: 16,
    color: "#777777",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 23,
  },
});
