import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { auth, db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function UserProfile({ route, navigation }) {
  const { user } = route.params;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(
  user.followers?.length || 0
);

useEffect(() => {
  const checkFollowingStatus = async () => {
    try {
      const currentUser = auth.currentUser;

     if (!currentUser) return;

      // Don't allow a user to follow themselves
      if (currentUser.uid === user.id) {
      setIsFollowing(false);
      return;
     }

      const userRef = doc(db, "users", user.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const latestUserData = userSnap.data();
        const followers = latestUserData.followers || [];

        setIsFollowing(followers.includes(currentUser.uid));
        setFollowersCount(followers.length);
      }
    } catch (error) {
      console.log("Error checking follow status:", error);
    }
  };

  checkFollowingStatus();
}, [user.id]);

  const followUser = async () => {
  try {
    const currentUser = auth.currentUser;

   if (!currentUser) return;

  // Don't allow self-follow
  if (currentUser.uid === user.id) {
  alert("You cannot follow yourself.");
  return;
   }

   if (isFollowing) {
  // Unfollow
  await updateDoc(doc(db, "users", user.id), {
    followers: arrayRemove(currentUser.uid),
  });

  await updateDoc(doc(db, "users", currentUser.uid), {
    following: arrayRemove(user.id),
  });

  setIsFollowing(false);
  setFollowersCount((prev) => prev - 1);
  alert("Unfollowed!");
} 
else {
  // Follow
  await updateDoc(doc(db, "users", user.id), {
    followers: arrayUnion(currentUser.uid),
  });

  await updateDoc(doc(db, "users", currentUser.uid), {
    following: arrayUnion(user.id),
  });

  // Get follower's profile from Firestore
const followerRef = doc(db, "users", currentUser.uid);
const followerSnap = await getDoc(followerRef);

const followerData = followerSnap.exists()
  ? followerSnap.data()
  : {};

const followerName = followerData.name || "Someone";

// Create follow notification
await addDoc(collection(db, "Notification"), {
  userId: user.id,
  senderId: currentUser.uid,
  senderName: followerName,
  senderPhotoURL: followerData.photoURL || "",
  type: "follow",
  message: followerName + " started following you",
  isRead: false,
  createdAt: serverTimestamp(),
});

  setIsFollowing(true);
  setFollowersCount((prev) => prev + 1);
  alert("Followed successfully!");
}
  }
 catch (error) {
    console.log(error);
  }
};

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Image
        source={
          user.photoURL
            ? { uri: user.photoURL }
            : require("../assets/icon.png")
        }
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          marginTop: 30,
        }}
      />

      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginTop: 20,
        }}
      >
        {user.name}
      </Text>

      <Text
        style={{
          fontSize: 18,
          marginTop: 10,
        }}
      >
        {user.bio || "No bio yet"}
      </Text>

      <TouchableOpacity
     onPress={() =>
     navigation.navigate("Followers", {
      user: user,
     })
    }
     style={{ marginTop: 10 }}
    >
  <Text style={{ fontSize: 16 }}>
    Followers: {followersCount}
  </Text>
</TouchableOpacity>

  <TouchableOpacity
  onPress={() =>
    navigation.navigate("Following", {
      user: user,
    })
  }
  style={{ marginTop: 10 }}
  >
  <Text style={{ fontSize: 16 }}>
    Following: {user.following?.length || 0}
  </Text>
  </TouchableOpacity>
  {auth.currentUser?.uid !== user.id && (
  <TouchableOpacity
    onPress={followUser}
    style={{
      backgroundColor: isFollowing ? "#888" : "#007AFF",
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
    }}
  >
    <Text
      style={{
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 18,
      }}
    >
      {isFollowing ? "Following" : "Follow"}
    </Text>
   </TouchableOpacity>
   )}
   <TouchableOpacity
   onPress={() =>
    navigation.navigate("Chat", {
      user: user,
    })
  }
  style={{
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: 150,
  }}
>
  <Text
    style={{
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 18,
    }}
  >
    💬 Message
  </Text>
</TouchableOpacity>
    </View>
  );
}