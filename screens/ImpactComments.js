import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

import { db, auth } from "../firebase";

import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ImpactComments({ route, navigation }) {
  const { impactId } = route.params;

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load comments
  useEffect(() => {
    const commentsRef = collection(
      db,
      "impacts",
      impactId,
      "comments"
    );

    const unsubscribe = onSnapshot(
      commentsRef,
      (snapshot) => {
        const commentList = snapshot.docs.map((commentDoc) => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        }));

        commentList.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;

          return aTime - bTime;
        });

        setComments(commentList);
        setLoading(false);
      },
      (error) => {
        console.log("IMPACT COMMENTS ERROR:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [impactId]);

  // Add comment
  const handleAddComment = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return;
    }

    const text = commentText.trim();

    if (!text) {
      return;
    }

    if (sending) {
      return;
    }

    try {
      setSending(true);

      const userRef = doc(
        db,
        "users",
        currentUser.uid
      );

      const userSnapshot = await getDoc(userRef);

      const userData = userSnapshot.exists()
        ? userSnapshot.data()
        : {};

      const commentData = {
        userId: currentUser.uid,
        userName: userData.name || "User",
        userPhoto: userData.photoURL || "",
        text: text,
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(
          db,
          "impacts",
          impactId,
          "comments"
        ),
        commentData
      );

      // Update comment count on the Impact
      const impactRef = doc(
        db,
        "impacts",
        impactId
      );

      const impactSnapshot = await getDoc(impactRef);

      if (impactSnapshot.exists()) {
        const currentComments =
          impactSnapshot.data().comments || 0;

        await updateDoc(impactRef, {
          comments: currentComments + 1,
        });
      }

      setCommentText("");
    } catch (error) {
      console.log("ADD IMPACT COMMENT ERROR:", error);
    } finally {
      setSending(false);
    }
  };

  const renderComment = ({ item }) => {
    return (
      <View style={styles.commentCard}>
        {item.userPhoto ? (
          <Image
            source={{ uri: item.userPhoto }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(item.userName || "U")
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.commentContent}>
          <Text style={styles.userName}>
            {item.userName || "User"}
          </Text>

          <Text style={styles.commentText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Comments
          </Text>

          <Text style={styles.headerSubtitle}>
            {comments.length} Comment
            {comments.length === 1 ? "" : "s"}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Comments */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#E83263"
          />

          <Text style={styles.loadingText}>
            Loading comments...
          </Text>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            💬
          </Text>

          <Text style={styles.emptyTitle}>
            No comments yet
          </Text>

          <Text style={styles.emptyText}>
            Be the first person to share something
            about this Impact.
          </Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Comment Input */}
      <View style={styles.inputArea}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          placeholderTextColor="#9299A6"
          multiline
          maxLength={500}
          style={styles.input}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!commentText.trim() || sending) &&
              styles.sendButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={!commentText.trim() || sending}
          onPress={handleAddComment}
        >
          {sending ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.sendIcon}>
              ➤
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },

  header: {
    height: 105,
    paddingTop: 48,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FC",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECF2",
  },

  backArrow: {
    fontSize: 36,
    lineHeight: 38,
    color: "#1F2A44",
    marginTop: -4,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2A44",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#687386",
    marginTop: 3,
  },

  headerSpacer: {
    width: 44,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#687386",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyEmoji: {
    fontSize: 52,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#687386",
  },

  list: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 15,
  },

  commentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E9ECF2",
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    marginRight: 11,
  },

  avatarPlaceholder: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#FCE8EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#E83263",
  },

  commentContent: {
    flex: 1,
  },

  userName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 4,
  },

  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5F6978",
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9ECF2",
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: "#F3F5F8",
    borderRadius: 23,
    paddingHorizontal: 17,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2A44",
    marginRight: 9,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E83263",
    justifyContent: "center",
    alignItems: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#C9CDD5",
  },

  sendIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "800",
  },
});