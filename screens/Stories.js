import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Pressable, Alert} from "react-native";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
export default function Stories({ route, navigation }) {
  const { story } = route.params;

//alert(
 // story.stories.map((s) => s.name).join("\n")
//);
 //console.log("Stories array:", JSON.stringify(story.stories, null, 2));

const [progress, setProgress] = useState(0);
const [currentStory, setCurrentStory] = useState(0);

const saveStoryView = async () => {
  try {
    await addDoc(collection(db, "storyViews"), {
      storyId: story.stories[currentStory].id,
      viewerUid: auth.currentUser.uid,
      viewedAt: Timestamp.now(),
    });
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  const timer = setInterval(() => {
    setProgress((prev) => Math.min(prev + 2, 100));
  }, 100);

  return () => clearInterval(timer);
}, []);
useEffect(() => {
  if (progress >= 100) {
    if (currentStory < story.stories.length - 1) {
     setCurrentStory((prev) => prev + 1);setProgress(0);
    } else {
      navigation.goBack();

    }
  }
}, [progress]);

  useEffect(() => {
  saveStoryView();
}, [currentStory]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
      }}
    >
      <Image
       source={{ uri: story.stories[currentStory].imageUrl }}
       style={{
       width: "100%",
       height: "100%",
       }}
        resizeMode="cover"
      />
    <Pressable
  onPress={() => {
    if (currentStory > 0) {
      setCurrentStory((prev) => prev - 1);
      setProgress(0);
    }
  }}
  style={{
    position: "absolute",
    left: 0,
    top: 0,
    width: "50%",
    height: "100%",
  }}
/>

<Pressable
  onPress={() => {
    if (currentStory < story.stories.length - 1) {
      setCurrentStory((prev) => prev + 1);
      setProgress(0);
    } else {
      navigation.goBack();
    }
  }}
  style={{
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: "100%",
  }}
/>
   <View
  style={{
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <View
  style={{
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    flexDirection: "row",
  }}
>
  {story.stories.map((item, index) => (
    <View
      key={index}
      style={{
        flex: 1,
        height: 4,
        backgroundColor: "#555",
        marginHorizontal: 2,
        borderRadius: 2,
      }}
    >
      <View
        style={{
       width: `${
  index < currentStory
    ? 100
    : index === currentStory
    ? progress
    : 0
}%`,
          height: 4,
          backgroundColor: "white",
          borderRadius: 2,
        }}
      />
    </View>
  ))}
</View>

  <Text
    style={{
      color: "white",
      fontSize: 22,
      fontWeight: "bold",
    }}
  >
    {story.stories[currentStory].name}
  </Text>

  <View
  style={{
    flexDirection: "row",
    alignItems: "center",
  }}
>
  <TouchableOpacity
    onPress={() =>
      navigation.navigate("StoryViews", {
        storyId: story.stories[currentStory].id,
      })
    }
    style={{ marginRight: 20 }}
  >
    <Text
      style={{
        color: "white",
        fontSize: 24,
      }}
    >
      👁️
    </Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text
      style={{
        color: "white",
        fontSize: 28,
      }}
    >
      ✕
    </Text>
  </TouchableOpacity>
</View>
    <Text
      style={{
        color: "white",
        fontSize: 28,
      }}
    > 
    </Text>
</View>
<View
  style={{
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  }}
>
  <TouchableOpacity
    onPress={() => {
console.log("Current Story:", story.stories[currentStory]);
console.log("Parent Story:", story);

  navigation.navigate("StoryReply", {
    story: story.stories[currentStory],
  });
}}
    style={{
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: 15,
      borderRadius: 25,
      alignItems: "center",
    }}
  >
    <Text
      style={{
        color: "white",
        fontSize: 16,
      }}
    >
      Reply to Story
    </Text>
  </TouchableOpacity>
</View>
</View>
  );
}