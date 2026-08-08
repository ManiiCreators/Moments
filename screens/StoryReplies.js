import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function StoryReplies() {
console.log("StoryReplies Screen Opened");
alert("StoryReplies Screen Opened");

  const [replies, setReplies] = useState([]);

  useEffect(() => {
    console.log("Current User UID:", auth.currentUser.uid);
    const q = query(
      collection(db, "storyReplies"),
      where("ownerUid", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
  }));

  console.log("Replies:", data);

   setReplies(data);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Story Replies
      </Text>

      <FlatList
        data={replies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}