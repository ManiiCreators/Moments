import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  addDoc,
  collection,
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function StoryReply({ route, navigation }) {
  const { story } = route.params;

  const [message, setMessage] = useState("");

 const sendReply = async () => {
  Alert.alert("Button Clicked");

  try {

console.log("Story Object:", story);
console.log("Story ID:", story.id);
console.log("Story UID:", story.uid);
Alert.alert("Story UID", String(story.uid));

    await addDoc(collection(db, "storyReplies"), {
      storyId: story.id,
      ownerUid: story.uid,
      senderUid: auth.currentUser.uid,
      message: message,
      createdAt: Timestamp.now(),
    });

// Create notification for Story owner
if (story.uid !== auth.currentUser.uid) {
  const userSnapshot = await getDoc(
    doc(db, "users", auth.currentUser.uid)
  );

  const userData = userSnapshot.exists()
    ? userSnapshot.data()
    : {};

  const senderName = userData.name || "Someone";

  await addDoc(collection(db, "Notification"), {
  userId: story.uid,
  senderId: auth.currentUser.uid,
  message: senderName + " replied to your story",
  type: "storyReply",
  storyId: story.id,
  replyText: message,
  isRead: false,
  createdAt: serverTimestamp(),
});
}

    Alert.alert("Success", "Reply sent!");
    navigation.goBack();
  } catch (error) {
    console.log(error);
    Alert.alert("Firebase Error", error.message);
  }
};

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Reply to Story
      </Text>

      <TextInput
        placeholder="Type your reply..."
        value={message}
        onChangeText={setMessage}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 15,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={sendReply}
        style={{
          backgroundColor: "#007AFF",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Send Reply
        </Text>
      </TouchableOpacity>
    </View>
  );
}