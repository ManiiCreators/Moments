import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";

import { auth, db } from "../firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function Messages({ navigation }) {
  const [chats, setChats] = useState([]);

useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "chats"),
    where(
      "participants",
      "array-contains",
      auth.currentUser.uid
    )
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chatList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setChats(chatList);
  });

  return unsubscribe;
}, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
       renderItem={({ item }) => {
  const otherUserId = item.participants?.find(
  (id) => id !== auth.currentUser.uid
);

const chatUser = {
  uid: otherUserId,
  name: item.userName || "Unknown User",
  photoURL: item.userPhotoURL || "",
};

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
  user: chatUser,
  userId: otherUserId,
})
      }
      style={{
        padding: 15,
        borderBottomWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          source={
            chatUser.photoURL
              ? { uri: chatUser.photoURL }
              : require("../assets/icon.png")
          }
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
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
            {chatUser.name}
          </Text>

          <Text
            style={{
              color: "gray",
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}}
      />
    </View>
  );
}