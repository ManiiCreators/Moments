import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, Image, RefreshControl,} from "react-native";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  increment,
  deleteDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export default function Home({ navigation, route }) {

  const flatListRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [reports, setReports] = useState([]);
  const [viewedStories, setViewedStories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  

useEffect(() => {
  loadReports();
  loadStories();
}, []);

const loadReports = async () => {
  try {
    setError("");

    const querySnapshot = await getDocs(collection(db, "posts"));

    const data = await Promise.all(
      querySnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();

        let userName = "Unknown User";
        let userPhoto = null;

        if (postData.userId) {
          const userSnapshot = await getDoc(
            doc(db, "users", postData.userId)
          );

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();

            userName = userData.name || "Unknown User";
            userPhoto = userData.photoURL || null;
          }
        }

        return {
          id: postDoc.id,
          ...postData,
          userName,
          userPhoto,
        };
      })
    );

    console.log("POSTS WITH USER INFO:", data);

    setReports(data);
  } catch (error) {
  console.log("LOAD POSTS ERROR:", error);
  setError("Unable to load Moments.");
}
finally {
  setLoading(false);
  setRefreshing(false);
}
};

const onRefresh = async () => {
  setRefreshing(true);

  try {
    await Promise.all([
      loadReports(),
      loadStories(),
    ]);
  } catch (error) {
    console.log("REFRESH ERROR:", error);
  } finally {
    setRefreshing(false);
  }
};

const loadStories = async () => {
  try {

const querySnapshot = await getDocs(collection(db, "stories"));

const now = Timestamp.now();

const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
 .filter((story) => {
  if (!story.createdAt) {
    return false;
  }

  const hours =
    (now.seconds - story.createdAt.seconds) / 3600;

  return hours < 24;
});
console.log(data);
const groupedStories = [];

data.forEach((story) => {
 const existingUser = groupedStories.find(
  (item) => item.uid === story.uid
);

  if (!existingUser) {
    groupedStories.push({
      ...story,
      stories: [story],
    });
  } else {
    existingUser.stories.push(story);
  }
});
setStories(groupedStories);

console.log("Before grouping:", data.length);
console.log("After grouping:", groupedStories.length);

groupedStories.forEach((user) => {
  console.log(
    user.name,
    "has",
    user.stories.length,
    "stories"
  );
});

setStories(groupedStories);
console.log("Grouped Stories:", JSON.stringify(groupedStories, null, 2));
console.log("Stories:", data);

  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  const postId = route?.params?.postId;

  if (!postId || reports.length === 0) {
    return;
  }

  const postIndex = reports.findIndex(
    (post) => post.id === postId
  );

  if (postIndex !== -1) {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: postIndex,
        animated: true,
      });
    }, 500);
  }
}, [route?.params?.postId, reports]);

const likePost = async (postId) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first!");
      return;
    }

    const postRef = doc(db, "posts", postId);

    const post = reports.find((item) => item.id === postId);

    if (!post) return;

    const likedBy = post.likedBy || [];

    const alreadyLiked = likedBy.includes(currentUser.uid);

    if (alreadyLiked) {
      // Unlike
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(currentUser.uid),
      });
    } else {
  // Like
  await updateDoc(postRef, {
    likes: increment(1),
    likedBy: arrayUnion(currentUser.uid),
  });

  // Create notification for the post owner
  if (post.userId !== currentUser.uid) {
  const userSnapshot = await getDoc(
    doc(db, "users", currentUser.uid)
  );

  const userData = userSnapshot.exists()
    ? userSnapshot.data()
    : {};

  const likerName = userData.name || "Someone";

console.log("CREATING LIKE NOTIFICATION");
console.log("Post owner:", post.userId);
console.log("Current user:", currentUser.uid);
console.log("Liker name:", likerName);

await addDoc(collection(db, "Notification"), {
    userId: post.userId,
    postId: postId,
    message: likerName + " liked your Moment",
    type: "like",
    isRead: false,
    createdAt: Timestamp.now(),
  });
  console.log("LIKE NOTIFICATION CREATED");
}
}

    loadReports();

  } catch (error) {
    console.log(error);
  }
};
const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
    loadReports();
    alert("Post deleted!");
  } catch (error) {
    console.log(error);
  }
};

const savePost = async (postId) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first!");
      return;
    }

    const postRef = doc(db, "posts", postId);
    const post = reports.find((item) => item.id === postId);

    if (!post) return;

    const savedBy = post.savedBy || [];
    const alreadySaved = savedBy.includes(currentUser.uid);

    if (alreadySaved) {
      await updateDoc(postRef, {
        savedBy: arrayRemove(currentUser.uid),
      });
    } else {
      await updateDoc(postRef, {
        savedBy: arrayUnion(currentUser.uid),
      });
    }

    loadReports();

  } catch (error) {
    console.log("SAVE POST ERROR:", error);
  }
};

return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Moments Feed</Text>

    <View style={styles.topButtonsContainer}>

  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={styles.compactButton}
      onPress={() => navigation.navigate("CreatePost")}
    >
      <Text style={styles.compactButtonText}>➕ Post</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.compactButton}
      onPress={() => navigation.navigate("CreateStory")}
    >
      <Text style={styles.compactButtonText}>⭕ Story</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.compactButton}
      onPress={() => navigation.navigate("Profile")}
    >
      <Text style={styles.compactButtonText}>👤 Profile</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={styles.compactButton}
      onPress={() => navigation.navigate("Search")}
    >
      <Text style={styles.compactButtonText}>🔍 Search</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.compactButton}
      onPress={() => navigation.navigate("Messages")}
    >
      <Text style={styles.compactButtonText}>💬 Messages</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.compactButton}
      onPress={() => navigation.navigate("Notifications")}
    >
      <Text style={styles.compactButtonText}>🔔 Alerts</Text>
    </TouchableOpacity>
  </View>

  </View>
  {loading && (
  <View style={{ padding: 30, alignItems: "center" }}>
    <Text style={{ fontSize: 18 }}>
      ⏳ Loading Moments...
    </Text>
  </View>
  )}

  {error && !loading && (
  <View style={{ alignItems: "center", padding: 25 }}>
    <Text style={{ fontSize: 18, fontWeight: "bold" }}>
      ⚠️ Unable to load Moments
    </Text>

    <Text style={{ marginTop: 8, color: "#666" }}>
      Please try again.
    </Text>

    <TouchableOpacity
      style={{
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
        marginTop: 15,
      }}
      onPress={loadReports}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>
        Try Again
      </Text>
    </TouchableOpacity>
  </View>
)}

  <FlatList
  ref={flatListRef}
  data={reports}
  refreshControl={
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
  />
}
ListEmptyComponent={
  !loading ? (
    <View style={{ alignItems: "center", padding: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        📸 No Moments yet
      </Text>

      <Text style={{ fontSize: 16, marginTop: 10 }}>
        Be the first to share a Moment!
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 10,
          marginTop: 20,
        }}
        onPress={() => navigation.navigate("CreatePost")}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Create a Moment
        </Text>
      </TouchableOpacity>
    </View>
  ) : null
}
  ListHeaderComponent={
    <FlatList
      data={stories}
      horizontal
      scrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: 5 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
         setViewedStories((prev) => [...prev, item.id]);
         navigation.navigate("Stories", { story: item });
        }}
          style={{ alignItems: "center", marginRight: 12 }}
        >
      <Image
     source={
     item.photoURL
      ? { uri: item.photoURL }
      : require("../assets/icon.png")
    }
     style={{
     width: 64,
     height: 64,
     borderRadius: 32,
     borderWidth: 3,
     borderColor: viewedStories.includes(item.id)
      ? "#999"
      : "#ff0066",
     }}
     />

          <Text style={{ marginTop: 3 }}>
            {item.name || "Unknown"}
          </Text>
        </TouchableOpacity>
      )}
    />
  }
  keyExtractor={(item) => item.id}
  contentContainerStyle={{
  padding: 15,
}}
  renderItem={({ item }) => (
<View
  style={{
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  }}
>
  <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingBottom: 6,
  }}
>
  <Image
    source={
      item.userPhoto
        ? { uri: item.userPhoto }
        : require("../assets/icon.png")
    }
    style={{
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    }}
  />

  <View style={{ flex: 1 }}>
    <Text
      style={{
        fontSize: 18,
        fontWeight: "bold",
      }}
    >
      {item.userName || "Unknown User"}
    </Text>

    <Text
      style={{
        fontSize: 13,
        color: "#777",
        marginTop: 2,
      }}
    >
      Moments
    </Text>
  </View>
</View>    
<Text
  style={{
    fontSize: 16,
    color: "#222",
    paddingHorizontal: 15,
    marginTop: 3,
    marginBottom: 5,
    lineHeight: 22,
  }}
>
  {item.caption}
</Text>
      {item.imageUrl ? (
  <Image
    source={{ uri: item.imageUrl }}
    style={{
      width: "100%",
      height: 300,
      marginTop: 5,
    }}
    resizeMode="cover"
  />
) : null}

<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  }}
>
  <TouchableOpacity
  onPress={() => likePost(item.id)}
  style={{
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: item.likedBy?.includes(auth.currentUser?.uid)
      ? "#ffdddd"
      : "#eeeeee",
  }}
>
  <Text
  style={{
    fontSize: 16,
    fontWeight: "bold",
  }}
>
  {item.likedBy?.includes(auth.currentUser?.uid)
    ? "💔 Unlike " + (item.likes || 0)
    : "❤️ Like " + (item.likes || 0)}
</Text>
</TouchableOpacity> 

  <TouchableOpacity
  onPress={() => navigation.navigate("Comment", { postId: item.id })}
  style={{
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eeeeee",
  }}
>
  <Text
    style={{
      fontSize: 16,
      fontWeight: "bold",
    }}
  >
    💬 comments {item.comments || 0}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => savePost(item.id)}
  style={{
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: item.savedBy?.includes(auth.currentUser?.uid)
      ? "#fff3cd"
      : "#eeeeee",
  }}
>
  <Text
    style={{
      fontSize: 16,
      fontWeight: "bold",
    }}
  >
    {item.savedBy?.includes(auth.currentUser?.uid)
      ? "🔖 Saved"
      : "🔖 Save"}
  </Text>
</TouchableOpacity>
</View>
<TouchableOpacity
  onPress={() => deletePost(item.id)}
  style={{
    alignSelf: "flex-end",
    backgroundColor: "#ffe5e5",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginTop: 3,
    marginRight: 12,
    marginBottom: 6,
  }}
>
  <Text
    style={{
      color: "#d60000",
      fontSize: 14,
      fontWeight: "600",
    }}
  >
    🗑️ Delete
  </Text>
</TouchableOpacity>
 </View>
  )}
/>

  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },

  topButtonsContainer: {
    paddingHorizontal: 12,
    marginBottom: 2,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  compactButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 3,
  },

  compactButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },

  subtitle: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: "bold",
  },
});