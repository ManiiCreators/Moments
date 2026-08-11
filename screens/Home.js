import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, Image} from "react-native";
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
  arrayRemove
} from "firebase/firestore";

export default function Home({ navigation, route }) {

  const flatListRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [reports, setReports] = useState([]);
  const [viewedStories, setViewedStories] = useState([]);

useEffect(() => {
  loadReports();
  loadStories();
}, []);

const loadReports = async () => {
  try {
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

return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Moments Feed</Text>

    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("CreatePost")}
    >
      <Text style={styles.buttonText}>Create Post</Text>
    </TouchableOpacity>

    <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("CreateStory")}
  >
  <Text style={styles.buttonText}>Create Story</Text>
  </TouchableOpacity>

    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("Profile")}
    >
      <Text style={styles.buttonText}>Profile</Text>
    </TouchableOpacity>
    <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Search")}
   >
  <Text style={styles.buttonText}>Search Users</Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Messages")}
>
  <Text style={styles.buttonText}>💬 Messages</Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Notifications")}
>
  <Text style={styles.buttonText}>🔔 Notifications</Text>
</TouchableOpacity>
  <FlatList
  ref={flatListRef}
  data={reports}
  ListHeaderComponent={
    <FlatList
      data={stories}
      horizontal
      scrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: 10 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
         setViewedStories((prev) => [...prev, item.id]);
         navigation.navigate("Stories", { story: item });
        }}
          style={{ alignItems: "center", marginRight: 15 }}
        >
      <Image
     source={
     item.photoURL
      ? { uri: item.photoURL }
      : require("../assets/icon.png")
    }
     style={{
     width: 70,
     height: 70,
     borderRadius: 35,
     borderWidth: 3,
     borderColor: viewedStories.includes(item.id)
      ? "#999"
      : "#ff0066",
     }}
     />

          <Text style={{ marginTop: 5 }}>
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
    <View style={{ padding: 15, marginBottom: 15, borderWidth: 1, borderRadius: 10 }}>
<View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
  <Image
    source={
      item.userPhoto
        ? { uri: item.userPhoto }
        : require("../assets/icon.png")
    }
    style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    }}
  />

  <Text style={{ fontWeight: "bold", fontSize: 18 }}>
    {item.userName || "Unknown User"}
  </Text>
</View>    
 <Text>{item.caption}</Text>

      {item.imageUrl ? (
   <Image
  source={{ uri: item.imageUrl }}
  style={{
    width: 300,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
  }}
  resizeMode="contain"
  />
) : null}

<View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  }}
  >
  <TouchableOpacity
  onPress={() => likePost(item.id)}
  style={{
    paddingVertical: 8,
    paddingHorizontal: 15,
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
  >
  <Text style={{ fontSize: 24 }}>
    💬 {item.comments}
  </Text>
</TouchableOpacity>
</View>
<TouchableOpacity
  onPress={() => deletePost(item.id)}
  style={{
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  }}
>
  <Text
    style={{
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    🗑️ Delete Post
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
  marginBottom: 40,
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
  subtitle: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: "bold",
  },
});