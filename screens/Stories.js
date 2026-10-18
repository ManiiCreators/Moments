import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
} from "react-native";

import {
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";


export default function Stories({ route, navigation }) {

  const { story } = route.params;

  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);


  // --------------------------------------------------
  // CURRENT STORY
  // --------------------------------------------------

  const currentStoryData = story?.stories?.[currentStory];

  const isOwnStory =
  currentStoryData?.uid === auth.currentUser?.uid;


  // --------------------------------------------------
  // SAVE STORY VIEW
  // --------------------------------------------------

  const saveStoryView = async () => {
    try {

      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("❌ No logged-in user");
        return;
      }

      if (!currentStoryData?.id) {
        console.log("❌ Story ID not found");
        return;
      }

      if (!currentStoryData?.uid) {
        console.log("❌ Story owner UID not found");
        return;
      }

      // Don't count the owner's own view
     if (currentStoryData.uid === currentUser.uid) {
     console.log("ℹ️ Own story - view not counted");
     return;
     }


      // One view document per user per story
      const viewId =
        `${currentStoryData.id}_${currentUser.uid}`;


      const viewRef = doc(
        db,
        "storyViews",
        viewId
      );


      // Save the story view
      await setDoc(viewRef, {

        storyId: currentStoryData.id,

        viewerUid: currentUser.uid,

        ownerUid: currentStoryData.uid,

        viewedAt: Timestamp.now(),

      });


      console.log("✅ STORY VIEW SAVED");

    } catch (error) {

      console.log(
        "❌ SAVE STORY VIEW ERROR:",
        error
      );

    }
  };


  // --------------------------------------------------
  // SAVE VIEW WHEN STORY CHANGES
  // --------------------------------------------------

  useEffect(() => {

    saveStoryView();

  }, [currentStory]);


  // --------------------------------------------------
  // STORY PROGRESS
  // --------------------------------------------------

  useEffect(() => {

    setProgress(0);

    const duration = 5000;
    const intervalTime = 50;

    let elapsed = 0;


    const interval = setInterval(() => {

      elapsed += intervalTime;

      const newProgress =
        elapsed / duration;

      setProgress(
        newProgress > 1
          ? 1
          : newProgress
      );


      if (elapsed >= duration) {

        clearInterval(interval);

        goToNextStory();

      }

    }, intervalTime);


    return () => {
      clearInterval(interval);
    };

  }, [currentStory]);


  // --------------------------------------------------
  // NEXT STORY
  // --------------------------------------------------

  const goToNextStory = () => {

    if (
      !story?.stories ||
      story.stories.length === 0
    ) {
      return;
    }


    if (
      currentStory <
      story.stories.length - 1
    ) {

      setCurrentStory(
        currentStory + 1
      );

    } else {

      navigation.goBack();

    }
  };


  // --------------------------------------------------
  // PREVIOUS STORY
  // --------------------------------------------------

  const goToPreviousStory = () => {

    if (currentStory > 0) {

      setCurrentStory(
        currentStory - 1
      );

    } else {

      setProgress(0);

    }
  };


  // --------------------------------------------------
  // REPLY BUTTON
  // --------------------------------------------------

  const openReplies = () => {

  console.log(
    "Current Story:",
    currentStoryData
  );

  console.log(
    "Parent Story:",
    story
  );

  navigation.navigate("StoryReply", {
    story: currentStoryData,
  });
};


  // --------------------------------------------------
  // STORY VIEWS
  // --------------------------------------------------

  const openStoryViews = () => {

    if (!currentStoryData?.id) {
      Alert.alert(
        "Error",
        "Story ID not found."
      );
      return;
    }


    navigation.navigate(
      "StoryViews",
      {
        storyId: currentStoryData.id,
      }
    );
  };


  // --------------------------------------------------
// DELETE STORY
// --------------------------------------------------

const deleteCurrentStory = () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    Alert.alert("Login Required", "Please login first.");
    return;
  }

  if (!currentStoryData?.id) {
    Alert.alert("Error", "Story ID not found.");
    return;
  }

  if (currentStoryData.uid !== currentUser.uid) {
    Alert.alert(
      "Not Allowed",
      "You can only delete your own Story."
    );
    return;
  }

  Alert.alert(
    "Delete Story",
    "Are you sure you want to permanently delete this Story?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(
              doc(db, "stories", currentStoryData.id)
            );

            Alert.alert(
              "Story Deleted",
              "Your Story has been deleted successfully.",
              [
                {
         text: "OK",
         onPress: () => {
         if (navigation.canGoBack()) {
         navigation.goBack();
         } else {
         navigation.navigate("Home");
        }
       },
      }
              ]
            );
          } catch (error) {
            console.log(
              "DELETE STORY ERROR:",
              error
            );

            Alert.alert(
              "Delete Failed",
              "Something went wrong while deleting your Story."
            );
          }
        },
      },
    ]
  );
};

  // --------------------------------------------------
  // SAFETY CHECK
  // --------------------------------------------------

  if (
    !story ||
    !story.stories ||
    story.stories.length === 0 ||
    !currentStoryData
  ) {

    return (

      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >

        <Text
          style={{
            color: "white",
            fontSize: 18,
          }}
        >
          No story available
        </Text>

      </View>

    );
  }


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <View
      style={{
        flex: 1,
        backgroundColor: "black",
      }}
    >

      {/* -------------------------------------------- */}
      {/* PROGRESS BARS */}
      {/* -------------------------------------------- */}

      <View
        style={{
          position: "absolute",
          top: 45,
          left: 10,
          right: 10,
          zIndex: 10,
          flexDirection: "row",
          gap: 4,
        }}
      >

        {story.stories.map(
          (item, index) => (

            <View
              key={item.id || index}
              style={{
                flex: 1,
                height: 3,
                backgroundColor:
                  "rgba(255,255,255,0.4)",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >

              <View
                style={{
                  height: "100%",
                  backgroundColor: "white",

                  width:
                    index < currentStory
                      ? "100%"
                      : index === currentStory
                      ? `${progress * 100}%`
                      : "0%",
                }}
              />

            </View>

          )
        )}

      </View>


      {/* -------------------------------------------- */}
      {/* USER INFORMATION */}
      {/* -------------------------------------------- */}

      <View
        style={{
          position: "absolute",
          top: 65,
          left: 15,
          right: 15,
          zIndex: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >

        <Image
          source={{
            uri:
              story.photoURL ||
              currentStoryData.photoURL,
          }}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            marginRight: 10,
            backgroundColor: "#777",
          }}
        />

        <Text
  style={{
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  }}
>
  {story.name ||
    currentStoryData.name ||
    "User"}
</Text>

{/* OWN STORY OPTIONS */}

{isOwnStory && (
  <TouchableOpacity
    onPress={() => setMenuVisible(true)}
    activeOpacity={0.7}
    style={{
      marginLeft: "auto",
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.14)",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text
      style={{
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
        marginTop: -8,
      }}
    >
      ...
    </Text>
  </TouchableOpacity>
)}

</View>


      {/* -------------------------------------------- */}
      {/* STORY IMAGE */}
      {/* -------------------------------------------- */}

      <Image
        source={{
          uri: currentStoryData.imageUrl,
        }}
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "contain",
        }}
      />


      {/* -------------------------------------------- */}
      {/* LEFT TAP - PREVIOUS */}
      {/* -------------------------------------------- */}

      <Pressable
        onPress={goToPreviousStory}
        style={{
          position: "absolute",
          left: 0,
          top: 100,
          bottom: 100,
          width: "35%",
        }}
      />


      {/* -------------------------------------------- */}
      {/* RIGHT TAP - NEXT */}
      {/* -------------------------------------------- */}

      <Pressable
        onPress={goToNextStory}
        style={{
          position: "absolute",
          right: 0,
          top: 100,
          bottom: 100,
          width: "65%",
        }}
      />


      {/* -------------------------------------------- */}
{/* BOTTOM ACTIONS */}
{/* -------------------------------------------- */}

<View
  style={{
    position: "absolute",
    bottom: 35,
    left: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: isOwnStory
      ? "flex-end"
      : "flex-start",
  }}
>
  {/* OTHER USER'S STORY → REPLY */}

  {!isOwnStory && (
    <TouchableOpacity
      onPress={openReplies}
      style={{
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 25,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 16,
        }}
      >
        💬 Reply
      </Text>
    </TouchableOpacity>
  )}

  {/* OWN STORY → VIEWS */}

  {isOwnStory && (
    <TouchableOpacity
      onPress={openStoryViews}
      style={{
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 25,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 16,
        }}
      >
        👁️ Views
      </Text>
    </TouchableOpacity>
  )}
  
</View>

        {/* REPLY */}

        <TouchableOpacity
          onPress={openReplies}
          style={{
            backgroundColor:
              "rgba(255,255,255,0.2)",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 25,
          }}
        >

          <Text
            style={{
              color: "white",
              fontSize: 16,
            }}
          >
            💬 Reply
          </Text>

        </TouchableOpacity>


        {/* STORY VIEWS */}

        <TouchableOpacity
          onPress={openStoryViews}
          style={{
            backgroundColor:
              "rgba(255,255,255,0.2)",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 25,
          }}
        >

          <Text
            style={{
              color: "white",
              fontSize: 16,
            }}
          >
            👁️ Views
          </Text>

        </TouchableOpacity>

        {/* -------------------------------------------- */}
{/* STORY OPTIONS MENU */}
{/* -------------------------------------------- */}

<Modal
  visible={menuVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={() => setMenuVisible(false)}
>
  <Pressable
    onPress={() => setMenuVisible(false)}
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.72)",
      justifyContent: "center",
      paddingHorizontal: 24,
    }}
  >
    <Pressable
      onPress={(event) => event.stopPropagation()}
      style={{
        backgroundColor: "#151D31",
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "#C9A85C",
        padding: 24,
      }}
    >
      {/* CLOSE */}

      <TouchableOpacity
        onPress={() => setMenuVisible(false)}
        style={{
          position: "absolute",
          right: 18,
          top: 18,
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "rgba(255,255,255,0.08)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 20,
          }}
        >
          ✕
        </Text>
      </TouchableOpacity>

      {/* TITLE */}

      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 25,
          fontWeight: "800",
          textAlign: "center",
          letterSpacing: 1,
          marginTop: 12,
        }}
      >
        STORY OPTIONS
      </Text>

      {/* GOLD DIVIDER */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 18,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: 65,
            height: 1,
            backgroundColor: "#C9A85C",
          }}
        />

        <Text
          style={{
            color: "#C9A85C",
            marginHorizontal: 10,
            fontSize: 12,
          }}
        >
          ◆
        </Text>

        <View
          style={{
            width: 65,
            height: 1,
            backgroundColor: "#C9A85C",
          }}
        />
      </View>

      <Text
        style={{
          color: "#9FA8BC",
          textAlign: "center",
          fontSize: 12,
          letterSpacing: 1.5,
          marginBottom: 24,
        }}
      >
        YOUR STORY • YOUR CHOICE
      </Text>

      {/* DELETE STORY */}

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          setMenuVisible(false);

          setTimeout(() => {
            deleteCurrentStory();
          }, 250);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 14,
          borderRadius: 16,
          backgroundColor: "rgba(232,50,99,0.10)",
          borderWidth: 1,
          borderColor: "rgba(232,50,99,0.25)",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(232,50,99,0.16)",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 14,
          }}
        >
          <Text style={{ fontSize: 20 }}>
            🗑️
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#FF668B",
              fontSize: 17,
              fontWeight: "700",
            }}
          >
            Delete Story
          </Text>

          <Text
            style={{
              color: "#929AAF",
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Permanently remove this story
          </Text>
        </View>

        <Text
          style={{
            color: "#FF668B",
            fontSize: 22,
          }}
        >
          ›
        </Text>
      </TouchableOpacity>

      {/* RETURN */}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setMenuVisible(false)}
        style={{
          marginTop: 22,
          height: 52,
          borderRadius: 26,
          backgroundColor: "#C9A85C",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#151D31",
            fontSize: 14,
            fontWeight: "800",
            letterSpacing: 0.8,
          }}
        >
          ← RETURN TO STORY
        </Text>
      </TouchableOpacity>
    </Pressable>
  </Pressable>
</Modal>

      </View>

  );
}