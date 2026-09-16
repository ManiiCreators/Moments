import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { View, Text, TextInput, TouchableOpacity} from "react-native";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot} from "firebase/firestore";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Comment({ route }) {
  const { postId } = route.params;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const postComment = async () => {
  if (comment.trim() === "") return;

  const currentUser = auth.currentUser;

  if (!currentUser) {
  alert("Please login first!");
  return;
}

  try {
    await addDoc(collection(db, "posts", postId, "comments"), {
  text: comment,
  userId: currentUser.uid,
  createdAt: serverTimestamp(),
});
     
   const postSnapshot = await getDoc(
  doc(db, "posts", postId)
);

const postData = postSnapshot.data();

if (
  postData &&
  currentUser &&
  postData.userId !== currentUser.uid
) {
  const userSnapshot = await getDoc(
    doc(db, "users", currentUser.uid)
  );

  const userData = userSnapshot.exists()
    ? userSnapshot.data()
    : {};

  const commenterName = userData.name || "Someone";

  await addDoc(collection(db, "Notification"), {
  userId: postData.userId,
  senderId: currentUser.uid,
  postId: postId,
  message: commenterName + " commented on your Moment",
  type: "comment",
  commentText: comment,
  isRead: false,
  createdAt: serverTimestamp(),
});
}

    await updateDoc(doc(db, "posts", postId), {
    comments: increment(1),
    });

    setComment("");
    //await loadComments();
    alert("Comment posted!");
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
};
const loadComments = () => {
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setComments(data);
  });
};

useEffect(() => {
  const unsubscribe = loadComments();

  return () => unsubscribe();
}, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Comments
      </Text>

      <TextInput
        placeholder="Write a comment..."
        value={comment}
        onChangeText={setComment}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          marginTop: 20,
        }}
      />

<TouchableOpacity
  onPress={postComment}
  style={{
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  }}
>
  <Text
    style={{
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    Post Comment
  </Text>
</TouchableOpacity>
{comments.map((item) => (
  <View
    key={item.id}
    style={{
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      marginTop: 10,
    }}
  >
    <Text>{item.text}</Text>
  </View>
))}
    </SafeAreaView>
  );
}