import React, { useState, useEffect, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, RefreshControl, Share, Alert } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
  const [activeFeed, setActiveFeed] = useState("For You");
  const [activeMenu, setActiveMenu] = useState(null);
  

useEffect(() => {
  loadReports();
  loadStories();
}, []);

useFocusEffect(
  React.useCallback(() => {
    loadStories();
  }, [])
);

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
       
      console.log(
  "POST OWNER:",
  postData.userId,
  "CURRENT USER:",
  auth.currentUser?.uid
);
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
    senderId: currentUser.uid,
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
<View style={styles.topHeader}>

  <Text style={styles.momentsLogo}>
    M<Text style={styles.logoHeart}>♥️</Text>ments
  </Text>

  <View style={styles.headerActions}>

    <TouchableOpacity
      style={styles.headerIconButton}
      onPress={() => navigation.navigate("Notifications")}
    >
      <Text style={styles.headerIcon}>♧</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.headerIconButton}
      onPress={() => navigation.navigate("Messages")}
    >
      <Text style={styles.headerIcon}>➤</Text>
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
  <View>

    {/* ================================
        STORIES SECTION
    ================================= */}

    <View style={styles.storiesSection}>

      <View style={styles.storiesHeader}>

  <View>
    <Text style={styles.storiesTitle}>
      Moments Stories
    </Text>

    <Text style={styles.storiesSubtitle}>
      Little moments, lasting memories.
    </Text>
  </View>

  <View style={{ flexDirection: "row", alignItems: "center" }}>

    {/* CREATE STORY */}
    <TouchableOpacity
      style={styles.addStoryButton}
      onPress={() =>
        navigation.navigate("CreateStory")
      }
    >
      <Text style={styles.addStoryText}>
        ＋ Story
      </Text>
    </TouchableOpacity>

  </View>

</View>


      {/* STORIES LIST */}

      {stories.length > 0 ? (

        <FlatList
          data={stories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.storyList}

          renderItem={({ item }) => (

            <TouchableOpacity
              onPress={() => {

                setViewedStories((prev) => [
                  ...prev,
                  item.id,
                ]);

                navigation.navigate("Stories", {
                  story: item,
                });

              }}

              style={styles.storyItem}
            >

              <View
                style={[
                  styles.storyRing,
                  {
                    borderColor:
                      viewedStories.includes(item.id)
                        ? "#C8C1BA"
                        : "#B58B5A",
                  },
                ]}
              >

                <Image
                  source={
                    item.photoURL
                      ? { uri: item.photoURL }
                      : require("../assets/icon.png")
                  }

                  style={styles.storyImage}
                />

              </View>

              <Text
                style={styles.storyName}
                numberOfLines={1}
              >
                {item.name || "Unknown"}
              </Text>

            </TouchableOpacity>

          )}
        />

      ) : (

        <View style={styles.emptyStories}>

          <Text style={styles.emptyStoriesIcon}>
            ✨
          </Text>

          <View style={{ flex: 1, justifyContent: "center" }}>

            <Text style={styles.emptyStoriesTitle}>
              No stories yet
            </Text>

            <Text style={styles.emptyStoriesText}>
              Share a little moment from your day.
            </Text>

          </View>

        </View>

      )}

    </View>

{/* ================================
    CREATE MOMENT CARD
================================= */}

<View style={styles.createMomentCard}>

  <View style={styles.createMomentIconCircle}>
    <Text style={styles.createMomentIcon}>
      ✨
    </Text>
  </View>

  <View style={styles.createMomentContent}>

    <Text style={styles.createMomentTitle}>
      What's on your mind?
    </Text>

    <Text style={styles.createMomentSubtitle}>
      Create a Moment and let the world know.
    </Text>

  </View>

  <TouchableOpacity
    style={styles.createMomentButton}
    onPress={() =>
      navigation.navigate("CreatePost")
    }
  >
    <Text style={styles.createMomentButtonText}>
      ＋ Create Moment
    </Text>
  </TouchableOpacity>

</View>

    {/* ================================
        FEED TABS
    ================================= */}

    <View style={styles.feedTabs}>

      {[
        "For You",
        "Following",
        "Nearby",
        "Trending",
      ].map((tab) => (

        <TouchableOpacity
          key={tab}
          onPress={() =>
            setActiveFeed(tab)
          }

          style={[
            styles.feedTab,

            activeFeed === tab &&
              styles.activeFeedTab,
          ]}
        >

          <Text
            style={[
              styles.feedTabText,

              activeFeed === tab &&
                styles.activeFeedTabText,
            ]}
          >
            {tab}
          </Text>

        </TouchableOpacity>

      ))}

    </View>

  </View>
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
<View style={styles.postHeader}>

  <Image
    source={
      item.userPhoto
        ? { uri: item.userPhoto }
        : require("../assets/icon.png")
    }
    style={styles.postAvatar}
  />

  <View style={styles.postUserInfo}>

    <Text
      style={styles.postUserName}
      numberOfLines={1}
    >
      {item.userName || "Unknown User"}
    </Text>

    <View style={styles.postMetaRow}>
      <Text style={styles.postMeta}>
        Moments
      </Text>

      <Text style={styles.metaDot}>
        •
      </Text>

      <Text style={styles.postMeta}>
        Public
      </Text>
    </View>

  </View>

  {/* MORE MENU */}
<View style={{ position: "relative" }}>

  <TouchableOpacity
    style={styles.moreButton}
    onPress={() => {
      setActiveMenu(
        activeMenu === item.id ? null : item.id
      );
    }}
  >
    <Text style={styles.moreButtonText}>•••</Text>
  </TouchableOpacity>

  {activeMenu === item.id && (
    <View style={styles.moreMenu}>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={async () => {
          try {
            await Share.share({
              message: '${item.userName || "Someone"} shared a Moment on Moments',
            });
          } catch (error) {
            console.log("SHARE ERROR:", error);
          }

          setActiveMenu(null);
        }}
      >
        <Text style={styles.menuIcon}>➤</Text>
        <Text style={styles.menuText}>Share</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          savePost(item.id);
          setActiveMenu(null);
        }}
      >
        <Text style={styles.menuIcon}>🔖</Text>

        <Text style={styles.menuText}>
          {item.savedBy?.includes(auth.currentUser?.uid)
            ? "Unsave"
            : "Save"}
        </Text>
      </TouchableOpacity>

      {item.userId === auth.currentUser?.uid && (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={() => {
      Alert.alert(
        "Delete Moment",
        "Are you sure you want to delete this Moment?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setActiveMenu(null);
              await deletePost(item.id);
            },
          },
        ]
      );
    }}
  >
    <Text style={styles.menuIcon}>🗑️</Text>

    <Text style={[styles.menuText, { color: "#C62828" }]}>
      Delete
    </Text>
  </TouchableOpacity>
)}

    </View>
  )}

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

<View style={styles.classicActionRow}>

  {/* LIKE */}
  <TouchableOpacity
    onPress={() => likePost(item.id)}
    style={styles.classicActionButton}
  >
    <Ionicons
      name={
        item.likedBy?.includes(auth.currentUser?.uid)
          ? "heart"
          : "heart-outline"
      }
      size={27}
      color={
        item.likedBy?.includes(auth.currentUser?.uid)
          ? "#E53935"
          : "#2C241F"
      }
    />

    <Text style={styles.classicActionCount}>
      {item.likes || 0}
    </Text>
  </TouchableOpacity>


  {/* COMMENT */}
  <TouchableOpacity
    onPress={() =>
      navigation.navigate("Comment", {
        postId: item.id,
      })
    }
    style={styles.classicActionButton}
  >
    <Ionicons
      name="chatbubble-outline"
      size={26}
      color="#2C241F"
    />

    <Text style={styles.classicActionCount}>
      {item.comments || 0}
    </Text>
  </TouchableOpacity>


  {/* SAVE */}
  <TouchableOpacity
    onPress={() => savePost(item.id)}
    style={styles.classicActionButton}
  >
    <Ionicons
      name={
        item.savedBy?.includes(auth.currentUser?.uid)
          ? "bookmark"
          : "bookmark-outline"
      }
      size={27}
      color="#2C241F"
    />
  </TouchableOpacity>


  {/* SHARE */}
  <TouchableOpacity
    onPress={async () => {
      try {
        await Share.share({
          message: '${item.userName || "Someone"} shared a Moment on Moments',
        });
      } catch (error) {
        console.log("SHARE ERROR:", error);
      }
    }}
    style={styles.classicActionButton}
  >
    <Ionicons
      name="send-outline"
      size={27}
      color="#2C241F"
    />
  </TouchableOpacity>

</View>
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
  heroSection: {
  marginHorizontal: 15,
  marginBottom: 10,
  padding: 22,
  borderRadius: 24,
  backgroundColor: "#F8F3EC",
  borderWidth: 1,
  borderColor: "#E8DED1",
},

heroTextContainer: {
  marginBottom: 18,
},

heroSmallTitle: {
  fontSize: 12,
  fontWeight: "700",
  letterSpacing: 3,
  color: "#9A8065",
  marginBottom: 8,
},

heroTitle: {
  fontSize: 28,
  fontWeight: "800",
  color: "#2C241F",
  lineHeight: 34,
},

heroSubtitle: {
  fontSize: 15,
  color: "#746A63",
  lineHeight: 22,
  marginTop: 8,
},

createMomentButton: {
  alignSelf: "flex-start",
  backgroundColor: "#2C241F",
  paddingVertical: 11,
  paddingHorizontal: 18,
  borderRadius: 22,
},

createMomentButtonText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "700",
},
storiesSection: {
  marginBottom: 18,
},

storiesHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
  paddingHorizontal: 2,
},

storiesTitle: {
  fontSize: 20,
  fontWeight: "800",
  color: "#2C241F",
},

storiesSubtitle: {
  fontSize: 13,
  color: "#8A817A",
  marginTop: 3,
},

addStoryButton: {
  backgroundColor: "#F3ECE4",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#E4D8CA",
},

addStoryText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#5C4B3D",
},

storyList: {
  paddingVertical: 4,
  paddingRight: 10,
},

storyItem: {
  width: 76,
  alignItems: "center",
  marginRight: 14,
},

storyRing: {
  width: 68,
  height: 68,
  borderRadius: 34,
  borderWidth: 2.5,
  padding: 3,
  backgroundColor: "#FFFFFF",
},

storyImage: {
  width: "100%",
  height: "100%",
  borderRadius: 31,
},

storyName: {
  marginTop: 6,
  fontSize: 13,
  fontWeight: "600",
  color: "#403831",
  maxWidth: 72,
  textAlign: "center",
},

emptyStories: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FBF8F4",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#EEE4D8",
  padding: 14,
},

emptyStoriesIcon: {
  fontSize: 28,
  marginRight: 12,
},

emptyStoriesTitle: {
  fontSize: 15,
  fontWeight: "700",
  color: "#403831",
},

emptyStoriesText: {
  fontSize: 13,
  color: "#8A817A",
  marginTop: 3,
},
topHeader: {
  height: 58,
  paddingHorizontal: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#FFFFFF",
  borderBottomWidth: 1,
  borderBottomColor: "#F0ECE7",
},

momentsLogo: {
  fontSize: 28,
  fontWeight: "800",
  color: "#2C241F",
  letterSpacing: -1,
},

logoHeart: {
  color: "#E85B68",
  fontSize: 25,
},

headerActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
},

headerIconButton: {
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
},

headerIcon: {
  fontSize: 25,
  color: "#2C241F",
  fontWeight: "500",
},
feedTabs: {
  flexDirection: "row",
  paddingHorizontal: 15,
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: "#EEE9E4",
  backgroundColor: "#FFFFFF",
},

feedTab: {
  flex: 1,
  alignItems: "center",
  paddingVertical: 11,
  marginHorizontal: 2,
  borderRadius: 18,
},

activeFeedTab: {
  backgroundColor: "#2C241F",
},

feedTabText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#817871",
},

activeFeedTabText: {
  color: "#FFFFFF",
},
postHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 2,
},

postUserSection: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
},

postAvatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12,
},

postUserName: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2C241F",
},

postMeta: {
  fontSize: 13,
  color: "#8A817A",
  marginTop: 2,
},

moreButton: {
  width: 38,
  height: 38,
  alignItems: "center",
  justifyContent: "center",
},

moreButtonText: {
  fontSize: 19,
  fontWeight: "800",
  color: "#6F665F",
},
postHeader: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 2,
},

postAvatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12,
},

postUserInfo: {
  flex: 1,
  justifyContent: "center",
},

postUserName: {
  fontSize: 17,
  fontWeight: "800",
  color: "#2C241F",
},

postMetaRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 3,
},

postMeta: {
  fontSize: 13,
  color: "#8A817A",
},

metaDot: {
  fontSize: 13,
  color: "#B5ADA6",
  marginHorizontal: 6,
},
classicActionRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderTopWidth: 1,
  borderColor: "#F0EAE3",
  backgroundColor: "#FFFFFF",
},

classicActionButton: {
  flexDirection: "row",
  alignItems: "center",
  minWidth: 52,
  minHeight: 36,
  marginRight: 18,
},

classicActionIcon: {
  fontSize: 27,
  color: "#3A332E",
  fontWeight: "400",
},

likedIcon: {
  color: "#E53945",
},

classicActionCount: {
  fontSize: 14,
  fontWeight: "700",
  color: "#5F5751",
  marginLeft: 6,
},

moreButton: {
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
},

moreButtonText: {
  fontSize: 20,
  fontWeight: "800",
  color: "#5F5751",
  letterSpacing: 2,
},
moreMenu: {
  position: "absolute",
  right: 0,
  top: 40,
  width: 145,
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: "#E8E2DC",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 8,

  elevation: 8,

  zIndex: 1000,
},

menuItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 14,
},

menuIcon: {
  fontSize: 18,
  width: 28,
},

menuText: {
  fontSize: 15,
  fontWeight: "600",
  color: "#3A332E",
},
addMomentButton: {
  backgroundColor: "#2C241F",
  paddingVertical: 8,
  paddingHorizontal: 11,
  borderRadius: 18,
  marginRight: 6,
},

addMomentText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#FFFFFF",
},
createMomentCard: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
  paddingVertical: 10,
  paddingHorizontal: 13,
  borderRadius: 20,
  backgroundColor: "#F8F0E5",
  borderWidth: 1,
  borderColor: "#E9D9C5",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},

createMomentIconCircle: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#B07A36",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
},

createMomentIcon: {
  fontSize: 22,
},

createMomentContent: {
  flex: 1,
  justifyContent: "center",
  paddingRight: 6,
},

createMomentTitle: {
  fontSize: 15,
  fontWeight: "800",
  color: "#2C241F",
},

createMomentSubtitle: {
  fontSize: 10.5,
  color: "#746A63",
  marginTop: 2,
  lineHeight: 14,
},

createMomentButton: {
  backgroundColor: "#2C241F",
  paddingVertical: 9,
  paddingHorizontal: 10,
  borderRadius: 19,
},

createMomentButtonText: {
  color: "#FFFFFF",
  fontSize: 10.5,
  fontWeight: "800",
},
});