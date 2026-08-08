import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList } from "react-native";
import { collection, getDocs, query, where, doc, getDoc,} from "firebase/firestore";
import { db } from "../firebase";

export default function StoryViews({ route }) {
  const { storyId } = route.params;

  const [viewers, setViewers] = useState([]);
  const loadViewers = async () => {
  const q = query(
    collection(db, "storyViews"),
    where("storyId", "==", storyId)
  );

  const snapshot = await getDocs(q);

const users = [];
const uniqueUsers = new Set();

  for (const viewDoc of snapshot.docs) {
    const view = viewDoc.data();

    const userRef = doc(db, "users", view.viewerUid);
    const userSnap = await getDoc(userRef);

   if (userSnap.exists() && !uniqueUsers.has(userSnap.id)) {
  uniqueUsers.add(userSnap.id);

  users.push({
    id: userSnap.id,
    ...userSnap.data(),
  });
}
  }

  setViewers(users);
};

useEffect(() => {
  loadViewers();
}, []);

    return (
  <View
    style={{
      flex: 1,
      backgroundColor: "white",
      paddingTop: 60,
      paddingHorizontal: 20,
    }}
  >
    <Text
      style={{
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 10,
      }}
    >
      👁️ Story Views
    </Text>

    <Text
      style={{
        fontSize: 18,
        marginBottom: 20,
      }}
    >
      Total Views: {viewers.length}
    </Text>

    <FlatList
      data={viewers}
     keyExtractor={(item, index) => item.id + index}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Image
            source={{ uri: item.photoURL }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              marginRight: 15,
            }}
          />

          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {item.name}
          </Text>
        </View>
      )}
    />
  </View>
);
}