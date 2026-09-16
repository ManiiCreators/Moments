import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";

import {
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";


export default function Stories({ route, navigation }) {

  const { story } = route.params;

  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);


  // --------------------------------------------------
  // CURRENT STORY
  // --------------------------------------------------

  const currentStoryData = story?.stories?.[currentStory];


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
      {/* BOTTOM BUTTONS */}
      {/* -------------------------------------------- */}

      <View
        style={{
          position: "absolute",
          bottom: 35,
          left: 15,
          right: 15,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >

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

      </View>

    </View>

  );
}