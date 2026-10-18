import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";


export default function StoryViews({ route, navigation }) {
  const { storyId } = route.params;

  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);


  // --------------------------------------------------
  // LOAD STORY VIEWERS
  // --------------------------------------------------

  const loadViewers = async () => {

    try {

      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("❌ No logged-in user");
        setLoading(false);
        return;
      }

      console.log("📖 STORY ID:", storyId);
      console.log("👤 OWNER UID:", currentUser.uid);


      const q = query(
        collection(db, "storyViews"),
        where("storyId", "==", storyId),
        where("ownerUid", "==", currentUser.uid)
      );


      const snapshot = await getDocs(q);


      console.log(
        "👁️ VIEW DOCUMENTS:",
        snapshot.size
      );


      const users = [];
      const uniqueUsers = new Set();


      for (const viewDoc of snapshot.docs) {

        const view = viewDoc.data();

        console.log(
          "👀 VIEW DATA:",
          view
        );


        if (!view.viewerUid) {
          continue;
        }


        const userRef = doc(
          db,
          "users",
          view.viewerUid
        );


        const userSnap = await getDoc(userRef);


        if (
          userSnap.exists() &&
          !uniqueUsers.has(userSnap.id)
        ) {

          uniqueUsers.add(userSnap.id);


          users.push({
            id: userSnap.id,
            ...userSnap.data(),
          });

        }

      }


      setViewers(users);

    } catch (error) {

      console.log(
        "❌ LOAD STORY VIEWS ERROR:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // --------------------------------------------------
  // LOAD WHEN SCREEN OPENS
  // --------------------------------------------------

  useEffect(() => {

    loadViewers();

  }, []);


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <View
  style={{
    flex: 1,
    backgroundColor: "#F8F6F0",
    paddingTop: 55,
    paddingHorizontal: 20,
  }}
>

      {/* PREMIUM HEADER */}

<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  }}
>
  <TouchableOpacity
    onPress={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    }}
    activeOpacity={0.75}
    style={{
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.08)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(201,168,92,0.35)",
    }}
  >
    <Text
      style={{
        color: "#1F2A44",
        fontSize: 25,
        marginTop: -2,
      }}
    >
      ‹
    </Text>
  </TouchableOpacity>

  <View
    style={{
      flex: 1,
      alignItems: "center",
      marginRight: 44,
    }}
  >
    <Text
      style={{
        color: "#1F2A44",
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 1,
      }}
    >
      STORY VIEWS
    </Text>

    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
      }}
    >
      <View
        style={{
          width: 34,
          height: 1,
          backgroundColor: "#C9A85C",
        }}
      />

      <Text
        style={{
          color: "#C9A85C",
          fontSize: 9,
          marginHorizontal: 8,
        }}
      >
        ◆
      </Text>

      <View
        style={{
          width: 34,
          height: 1,
          backgroundColor: "#C9A85C",
        }}
      />
    </View>

    <Text
      style={{
        color: "#667085",
        fontSize: 10,
        letterSpacing: 1.5,
        marginTop: 6,
      }}
    >
      PEOPLE WHO SAW YOUR STORY
    </Text>
  </View>
</View>

{/* VIEW COUNT CARD */}

<View
  style={{
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C9A85C",
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  }}
>
  <View
    style={{
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#F4EBD3",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    }}
  >
    <Text style={{ fontSize: 22 }}>
      👁️
    </Text>
  </View>

  <View>
    <Text
      style={{
        color: "#1F2A44",
        fontSize: 25,
        fontWeight: "800",
      }}
    >
      {viewers.length}
    </Text>

    <Text
      style={{
        color: "#667085",
        fontSize: 12,
        letterSpacing: 0.8,
        marginTop: 2,
      }}
    >
      TOTAL VIEWS
    </Text>
  </View>
</View>


      {/* LOADING */}

      {loading ? (

        <View
          style={{
            alignItems: "center",
            marginTop: 30,
          }}
        >

          <ActivityIndicator size="large" />

          <Text
     style={{
     marginTop: 10,
    fontSize: 16,
    color: "#9FA8BC",
    }}
    >
    Loading viewers...
    </Text>
        </View>

      ) : (

        <FlatList
          data={viewers}
          keyExtractor={(item) => item.id}

          ListEmptyComponent={
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      marginTop: 70,
      paddingHorizontal: 30,
    }}
  >
    <View
      style={{
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: "rgba(201,168,92,0.10)",
        borderWidth: 1,
        borderColor: "rgba(201,168,92,0.25)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <Text style={{ fontSize: 30 }}>
        👁️
      </Text>
    </View>

    <Text
      style={{
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
      }}
    >
      No views yet
    </Text>

    <Text
      style={{
        color: "#8F99AE",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 21,
      }}
    >
      When someone views your story,
      {"\n"}
      they'll appear here.
    </Text>
  </View>
}

         renderItem={({ item }) => (
  <TouchableOpacity
  activeOpacity={0.8}
  onPress={() =>
  navigation.navigate("UserProfile", {
    user: item,
  })
}
  style={{
    backgroundColor: "#FFFFFF",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(201,168,92,0.55)",
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    {/* PROFILE PHOTO */}

    <Image
      source={{
        uri:
          item.photoURL ||
          "https://via.placeholder.com/50",
      }}
      style={{
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 14,
        backgroundColor: "#EEEAE0",
      }}
    />

    {/* USER INFO */}

    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: "#1F2A44",
          fontSize: 17,
          fontWeight: "700",
        }}
      >
        {item.name || "Unknown User"}
      </Text>

      <Text
        style={{
          color: "#7A8190",
          fontSize: 12,
          marginTop: 4,
        }}
      >
        Viewed your story
      </Text>
    </View>

    {/* CHEVRON */}

    <Text
      style={{
        color: "#C9A85C",
        fontSize: 28,
        fontWeight: "300",
        marginLeft: 8,
      }}
    >
      ›
    </Text>
 </TouchableOpacity>
)}

        />

      )}

    </View>

  );

}