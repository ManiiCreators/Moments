import React, { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image,} from "react-native";
import { auth, db } from "../firebase";
import { collection, addDoc, setDoc, query, orderBy, onSnapshot, Timestamp, doc, getDoc, deleteDoc} from "firebase/firestore";

export default function Chat({ route, navigation }) {
  const { user, userId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(false); 
  const [isTyping, setIsTyping] = useState(false);
  

  const [replyingTo, setReplyingTo] = useState(null);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserId = auth.currentUser?.uid;
  const otherUserId = user?.uid || user?.id;

// Update MY online status
useEffect(() => {
  if (!currentUserId) return;

  const myUserRef = doc(db, "Users", currentUserId);

  setDoc(
    myUserRef,
    {
      isOnline: true,
      lastSeen: Timestamp.now(),
    },
    { merge: true }
  );

  return () => {
    setDoc(
      myUserRef,
      {
        isOnline: false,
        lastSeen: Timestamp.now(),
      },
      { merge: true }
    );
  };
}, [currentUserId]);


// Watch the OTHER user's online status
useEffect(() => {
  if (!otherUserId) return;

  const otherUserRef = doc(db, "Users", otherUserId);

  const unsubscribe = onSnapshot(otherUserRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.data();

    setIsOnline(data.isOnline === true);
    setIsTyping(data.isTyping === true);

  } else {
    setIsOnline(false);
    setIsTyping(false);
  }
});

  return unsubscribe;
}, [otherUserId]);

const chatId =
  currentUserId < otherUserId
    ? currentUserId + "_" + otherUserId
    : otherUserId + "_" + currentUserId;

useEffect(() => {
  if (!chatId) return;

  const messagesRef = collection(db, "chats", chatId, "messages");

  const q = query(messagesRef, orderBy("createdAt", "asc"));

const unsubscribe = onSnapshot(q, (snapshot) => {
  const messageList = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

console.log("MESSAGES:", messageList);

// Mark received messages as delivered
messageList.forEach(async (item) => {
  if (
    item.senderId !== auth.currentUser?.uid &&
    item.status === "sent"
  ) {
    await setDoc(
      doc(db, "chats", chatId, "messages", item.id),
      {
        status: "delivered",
      },
      { merge: true }
    );
  }
});

console.log("MESSAGES:", messageList);

setMessages(messageList);
   setTimeout(() => {
  flatListRef.current?.scrollToEnd({ animated: true });
}, 100);
});

  return unsubscribe;
}, [chatId]);

const handleTyping = async (text) => {
  setMessage(text);

  if (!currentUserId) return;

  const myUserRef = doc(db, "Users", currentUserId);

  if (text.trim().length > 0) {
    await setDoc(
      myUserRef,
      {
        isTyping: true,
      },
      { merge: true }
    );

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      await setDoc(
        myUserRef,
        {
          isTyping: false,
        },
        { merge: true }
      );
    }, 1500);
  } else {
    clearTimeout(typingTimeoutRef.current);

    await setDoc(
      myUserRef,
      {
        isTyping: false,
      },
      { merge: true }
    );
  }
};

const handleDeleteMessage = async (messageId) => {
  try {
    await deleteDoc(
      doc(db, "chats", chatId, "messages", messageId)
    );
  } catch (error) {
    console.log("Error deleting message:", error);
  }
};

const handleSend = async () => {
  console.log("MESSAGE:", message);
  console.log("CHAT ID:", chatId);
  console.log("USER ID:", userId);

  if (!message.trim()) return;

  const text = message.trim();

  console.log("CHAT ID:", chatId);
  console.log("MY UID:", auth.currentUser?.uid);
  console.log("USER ID:", user?.id);

  setMessage("");

  try {
    await addDoc(
  collection(db, "chats", chatId, "messages"),
  {
    text: text,
    senderId: auth.currentUser.uid,
    createdAt: Timestamp.now(),
    status: "sent",
  }
  );

    await setDoc(
      doc(db, "chats", chatId),
      {
      participants: [
     auth.currentUser.uid,
     user.uid || user.id,
     ],
        lastMessage: text,
        lastMessageAt: Timestamp.now(),
        userName: user.name || "Unknown User",
        userPhotoURL: user.photoURL || "",
      },
      { merge: true }
    );

  } catch (error) {
    console.log("Error sending message:", error);
  }
  };
  return (
  <View style={{ flex: 1 }}>

    {/* Header */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 28 }}>←</Text>
      </TouchableOpacity>

      <Image
        source={
          user.photoURL
            ? { uri: user.photoURL }
            : require("../assets/icon.png")
        }
        style={{
          width: 45,
          height: 45,
          borderRadius: 22.5,
          marginLeft: 15,
          marginRight: 12,
        }}
      />

      <View>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
          }}
        >
          {user.name}
        </Text>

        <Text
  style={{
    color: isTyping ? "#ff4f6d" : isOnline ? "green" : "gray",
    fontSize: 14,
  }}
>
  {isTyping
    ? "typing..."
    : isOnline
    ? "🟢 Online"
    : "⚫ Offline"}
    </Text>
      </View>
    </View>

    {/* Messages */}
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
   renderItem={({ item }) => {
  const isMyMessage =
    item.senderId === auth.currentUser?.uid;

  return (
    <View
      style={{
        alignSelf: isMyMessage ? "flex-end" : "flex-start",
        paddingHorizontal: 10,
        marginVertical: 5,
      }}
    >
    <TouchableOpacity
  onLongPress={() => {
    setReplyingTo(item);
  }}
  activeOpacity={0.8}
  style={{
    backgroundColor: isMyMessage
      ? "#ff4f6d"
      : "#e5e5e5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "75%",
   }}
   > 
        <Text
          style={{
            fontSize: 16,
            color: isMyMessage ? "white" : "black",
          }}
        >
          {item.text}
        </Text>
    <Text
    style={{
    fontSize: 11,
    color: isMyMessage ? "#ffe5eb" : "#777",
    marginTop: 4,
    alignSelf: "flex-end",
    }}
   >
  {item.createdAt?.toDate
    ? item.createdAt.toDate().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""}

    {isMyMessage && (
  <Text
    style={{
      fontSize: 11,
      color: "#ffe5eb",
      marginLeft: 4,
    }}
  >
    {item.status === "delivered" ? "✓✓" : "✓"}
  </Text>
   )}
    </Text>
  </TouchableOpacity>
    </View>
    );
    }}
      style={{ flex: 1 }}
    />
 
    {replyingTo && (
  <View
    style={{
      padding: 10,
      backgroundColor: "#f2f2f2",
      borderTopWidth: 1,
      borderTopColor: "#ddd",
    }}
  >
    <Text style={{ fontSize: 13, color: "#777" }}>
      Replying to:
    </Text>

    <Text
      numberOfLines={1}
      style={{
        fontSize: 15,
        fontWeight: "bold",
        marginTop: 3,
      }}
    >
      {replyingTo.text}
    </Text>

    <TouchableOpacity
      onPress={() => setReplyingTo(null)}
      style={{
        position: "absolute",
        right: 10,
        top: 10,
      }}
    >
      <Text style={{ fontSize: 18 }}>✕</Text>
    </TouchableOpacity>
  </View>
)}

    {/* Message input */}
    <View
      style={{
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
      }}
    >
      <TextInput
        value={message}
        onChangeText={handleTyping}
        placeholder="Type a message..."
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 20,
          paddingHorizontal: 15,
          marginRight: 10,
        }}
      />

      <TouchableOpacity
        onPress={handleSend}
        style={{
          backgroundColor: "#ff4f6d",
          paddingHorizontal: 18,
          justifyContent: "center",
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Send
        </Text>
      </TouchableOpacity>
    </View>

  </View>
);
}