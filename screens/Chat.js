import React, { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform, Modal, Pressable,} from "react-native";
import { auth, db } from "../firebase";
import { collection, addDoc, setDoc, query, orderBy, onSnapshot, Timestamp, doc, deleteDoc, arrayUnion,} from "firebase/firestore";

export default function Chat({ route, navigation }) {
  const { user, userId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(false); 
  const [isTyping, setIsTyping] = useState(false);
  

  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
const [optionsVisible, setOptionsVisible] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserId = auth.currentUser?.uid;
  const otherUserId = user?.uid || user?.id;

// Update MY online status
useEffect(() => {
  if (!currentUserId) return;

  const myUserRef = doc(db, "users", currentUserId);

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

  const otherUserRef = doc(db, "users", otherUserId);

const unsubscribe = onSnapshot(
  otherUserRef,
  (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();

      setIsOnline(data.isOnline === true);
      setIsTyping(data.isTyping === true);
    } else {
      setIsOnline(false);
      setIsTyping(false);
    }
  },
  (error) => {
    console.log("USER STATUS ERROR:", error);
  }
);

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

const unsubscribe = onSnapshot(
  q,
  (snapshot) => {
  const messageList = snapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .filter(
    (item) =>
      !item.deletedFor?.includes(currentUserId)
  );

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

    const visibleMessages = messageList.filter(
  (item) =>
    !item.deletedFor ||
    !item.deletedFor.includes(currentUserId)
);

setMessages(visibleMessages);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  },
  (error) => {
    console.log("CHAT MESSAGES ERROR:", error);
  }
);

  return unsubscribe;
}, [chatId]);

const handleTyping = async (text) => {
  setMessage(text);

  if (!currentUserId) return;

  const myUserRef = doc(db, "users", currentUserId);

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

// DELETE FOR ME
const handleDeleteForMe = async (messageId) => {
  try {
    await setDoc(
      doc(db, "chats", chatId, "messages", messageId),
      {
        deletedFor: arrayUnion(currentUserId),
      },
      { merge: true }
    );

    console.log("Deleted for me successfully");
  } catch (error) {
    console.log("DELETE FOR ME ERROR:", error);
  }
};


// DELETE FOR EVERYONE
const handleDeleteForEveryone = async (messageId) => {
  try {
    await deleteDoc(
      doc(db, "chats", chatId, "messages", messageId)
    );

    console.log("Deleted for everyone successfully");
  } catch (error) {
    console.log("DELETE FOR EVERYONE ERROR:", error);
  }
};

const handleSend = async () => {
  console.log("SEND BUTTON CLICKED");

  if (!message.trim()) {
    console.log("Message is empty");
    return;
  }

  if (!currentUserId || !otherUserId) {
    console.log("User ID missing");
    return;
  }

  const text = message.trim();

  try {
    console.log("Sending:", text);

    // Create reply data
    const replyData = replyingTo
      ? {
          messageId: replyingTo.id,
          text: replyingTo.text || "",
          senderId: replyingTo.senderId || "",
        }
      : null;

    // STEP 1: Create/update chat
    await setDoc(
      doc(db, "chats", chatId),
      {
        participants: [
          currentUserId,
          otherUserId,
        ],
        lastMessage: text,
        lastMessageAt: Timestamp.now(),
        userName: user?.name || "Unknown User",
        userPhotoURL: user?.photoURL || "",
      },
      { merge: true }
    );

    console.log("Chat updated successfully");

    // STEP 2: Send message
    await addDoc(
      collection(db, "chats", chatId, "messages"),
      {
        text: text,
        senderId: currentUserId,
        createdAt: Timestamp.now(),
        status: "sent",
        replyTo: replyData,
      }
    );

    console.log("MESSAGE SENT SUCCESSFULLY");

    // Clear input
    setMessage("");

    // Clear reply
    setReplyingTo(null);

  } catch (error) {
    console.log("SEND ERROR:", error);
  }
};
  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >

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
  setSelectedMessage(item);
  setOptionsVisible(true);
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

  {/* SHOW REPLIED MESSAGE */}
  {item.replyTo && (
    <View
      style={{
        backgroundColor: isMyMessage
          ? "rgba(255,255,255,0.15)"
          : "#d5d5d5",
        padding: 8,
        borderRadius: 10,
        marginBottom: 8,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontSize: 13,
          fontWeight: "bold",
          color: isMyMessage ? "white" : "#555",
        }}
      >
        {item.replyTo.text}
      </Text>
    </View>
  )}

  {/* ACTUAL MESSAGE */}
  <Text
    style={{
      fontSize: 16,
      color: isMyMessage ? "white" : "black",
    }}
  >
    {item.text}
  </Text>

  {/* TIME */}
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
      marginHorizontal: 10,
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: "#fff",
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#ff4f6d",
      borderWidth: 1,
      borderColor: "#eee",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    {/* Reply title */}
    <Text
      style={{
        fontSize: 13,
        fontWeight: "bold",
        color: "#ff4f6d",
        marginBottom: 4,
      }}
    >
      ↩️ Replying to
    </Text>

    {/* Replied message */}
    <Text
      numberOfLines={1}
      style={{
        fontSize: 15,
        color: "#333",
        paddingRight: 35,
      }}
    >
      {replyingTo.text}
    </Text>

    {/* Cancel reply */}
    <TouchableOpacity
      onPress={() => setReplyingTo(null)}
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: "#777",
          fontWeight: "bold",
        }}
      >
        ✕
      </Text>
    </TouchableOpacity>
  </View>
)}

    {/* Message input */}
    <View
  style={{
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
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

    <Modal
  visible={optionsVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => {
    setOptionsVisible(false);
    setSelectedMessage(null);
  }}
>
  <Pressable
    onPress={() => {
      setOptionsVisible(false);
      setSelectedMessage(null);
    }}
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      paddingHorizontal: 30,
    }}
  >
    <Pressable
      onPress={() => {}}
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        paddingVertical: 10,
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          paddingHorizontal: 25,
          paddingTop: 20,
          paddingBottom: 8,
        }}
      >
        Message options
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#777",
          paddingHorizontal: 25,
          paddingBottom: 15,
        }}
      >
        Choose an action
      </Text>

      {/* Reply */}
      <TouchableOpacity
        onPress={() => {
          setReplyingTo(selectedMessage);
          setOptionsVisible(false);
          setSelectedMessage(null);
        }}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 25,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            color: "#ff4f6d",
          }}
        >
          Reply
        </Text>
      </TouchableOpacity>

      {/* Delete for me */}
      <TouchableOpacity
        onPress={() => {
          if (selectedMessage) {
            handleDeleteForMe(selectedMessage.id);
          }

          setOptionsVisible(false);
          setSelectedMessage(null);
        }}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 25,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            color: "#ff4f6d",
          }}
        >
          Delete for me
        </Text>
      </TouchableOpacity>

      {/* Delete for everyone - only my message */}
      {selectedMessage &&
        selectedMessage.senderId === currentUserId && (
          <TouchableOpacity
            onPress={() => {
              handleDeleteForEveryone(selectedMessage.id);

              setOptionsVisible(false);
              setSelectedMessage(null);
            }}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 25,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                color: "#ff4f6d",
              }}
            >
              Delete for everyone
            </Text>
          </TouchableOpacity>
        )}

      {/* Cancel */}
      <TouchableOpacity
        onPress={() => {
          setOptionsVisible(false);
          setSelectedMessage(null);
        }}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 25,
          borderTopWidth: 1,
          borderTopColor: "#eee",
        }}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: "bold",
            color: "#777",
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </Pressable>
  </Pressable>
</Modal>

  </KeyboardAvoidingView>

);
}