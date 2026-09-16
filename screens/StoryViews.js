import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
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


export default function StoryViews({ route }) {

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
        backgroundColor: "white",
        paddingTop: 60,
        paddingHorizontal: 20,
      }}
    >

      {/* HEADER */}

      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        👁️ Story Views
      </Text>


      {/* TOTAL */}

      <Text
        style={{
          fontSize: 18,
          marginBottom: 20,
        }}
      >
        Total Views: {viewers.length}
      </Text>


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

            <Text
              style={{
                fontSize: 16,
                color: "gray",
                marginTop: 20,
              }}
            >
              No views yet.
            </Text>

          }

          renderItem={({ item }) => (

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
            >

              <Image
                source={{
                  uri:
                    item.photoURL ||
                    "https://via.placeholder.com/50",
                }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 15,
                  backgroundColor: "#ddd",
                }}
              />


              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {item.name || "Unknown User"}
              </Text>

            </View>

          )}

        />

      )}

    </View>

  );

}