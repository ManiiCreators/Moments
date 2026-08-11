import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setNotifications([]);
        return;
      }

      console.log("Logged-in user UID:", user.uid);

      const q = query(
        collection(db, "Notification"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeNotifications = onSnapshot(
        q,
        (snapshot) => {
          console.log("Notifications found:", snapshot.size);

          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setNotifications(data);
        },
        (error) => {
          console.log("Notification error:", error);
        }
      );

      return unsubscribeNotifications;
    });

    return unsubscribeAuth;
  }, []);

  const renderNotification = ({ item }) => {
    const isComment = item.type === "comment";
    const isLike = item.type === "like";

    return (
      <TouchableOpacity
        style={[
          styles.notification,
          item.isRead === false && styles.unread,
        ]}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {isComment ? "💬" : isLike ? "❤️" : "🔔"}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.message}>
            {item.message}
          </Text>

          {isComment && item.commentText ? (
            <Text style={styles.comment}>
              "{item.commentText}"
            </Text>
          ) : null}

          {isLike ? (
            <Text style={styles.action}>
              Liked your Moment
            </Text>
          ) : null}

          <Text style={styles.time}>
            {item.isRead === false ? "New" : "Notification"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Notifications
      </Text>

      {notifications.length === 0 ? (
        <Text style={styles.empty}>
          No notifications yet
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  notification: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },

  unread: {
    backgroundColor: "#f5f8ff",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 24,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  message: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },

  comment: {
    fontSize: 15,
    color: "#666",
    marginTop: 7,
    fontStyle: "italic",
  },

  action: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },

  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 7,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#777",
  },
});