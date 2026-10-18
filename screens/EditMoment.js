import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { db, auth } from "../firebase";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function EditMoment({ route, navigation }) {
  const { postId } = route.params || {};

  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMoment();
  }, [postId]);

  const loadMoment = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !postId) {
        Alert.alert("Error", "Moment could not be loaded.");
        navigation.goBack();
        return;
      }

      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        Alert.alert("Not Found", "This Moment no longer exists.");
        navigation.goBack();
        return;
      }

      const data = postSnap.data();

      // OWNER PROTECTION
      if (data.userId !== currentUser.uid) {
        Alert.alert(
          "Not Allowed",
          "You can only edit your own Moment."
        );
        navigation.goBack();
        return;
      }

      setCaption(data.caption || "");
      setImageUrl(data.imageUrl || "");
    } catch (error) {
      console.log("LOAD MOMENT ERROR:", error);

      Alert.alert(
        "Error",
        "Unable to load this Moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || !postId || saving) return;

    try {
      setSaving(true);

      const postRef = doc(db, "posts", postId);

      // Check again before updating
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        Alert.alert(
          "Not Found",
          "This Moment no longer exists."
        );
        return;
      }

      const data = postSnap.data();

      if (data.userId !== currentUser.uid) {
        Alert.alert(
          "Not Allowed",
          "You can only edit your own Moment."
        );
        return;
      }

      await updateDoc(postRef, {
        caption: caption.trim(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        "Moment Updated ❤️",
        "Your Moment has been updated successfully.",
        [
          {
            text: "DONE",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log("UPDATE MOMENT ERROR:", error);

      Alert.alert(
        "Update Failed",
        "Something went wrong while updating your Moment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#151F35"
        />

        <ActivityIndicator
          size="large"
          color="#D7B56D"
        />

        <Text style={styles.loadingText}>
          Opening your Moment...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#151F35"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#FFF4D8"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            EDIT MOMENT
          </Text>

          <View style={styles.headerSubtitleRow}>
            <View style={styles.smallLine} />

            <Text style={styles.headerSubtitle}>
              YOUR MEMORY
            </Text>

            <View style={styles.smallLine} />
          </View>
        </View>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* IMAGE */}
        {imageUrl ? (
          <View style={styles.imageFrame}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.imageBadge}>
              <Ionicons
                name="images-outline"
                size={17}
                color="#FFF4D8"
              />

              <Text style={styles.imageBadgeText}>
                MOMENT
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noImage}>
            <Ionicons
              name="image-outline"
              size={36}
              color="#D7B56D"
            />

            <Text style={styles.noImageText}>
              Moment without photo
            </Text>
          </View>
        )}

        {/* DECORATION */}
        <View style={styles.decorRow}>
          <View style={styles.decorLine} />
          <View style={styles.diamond} />
          <View style={styles.decorLine} />
        </View>

        <Text style={styles.sectionLabel}>
          A MOMENT TO REMEMBER
        </Text>

        <Text style={styles.title}>
          Edit Your Memory
        </Text>

        <Text style={styles.description}>
          Make a small change while keeping the memory itself.
        </Text>

        {/* CAPTION */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Ionicons
              name="create-outline"
              size={19}
              color="#D7B56D"
            />

            <Text style={styles.inputLabel}>
              MOMENT CAPTION
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={caption}
            onChangeText={setCaption}
            placeholder="Write something about this Moment..."
            placeholderTextColor="#788198"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>
            {caption.length}/500
          </Text>
        </View>

        {/* SAVE */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={saving}
          onPress={handleUpdate}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#151F35"
            />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#151F35"
              />

              <Text style={styles.saveButtonText}>
                SAVE CHANGES
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          MOMENTS • MEMORIES THAT STAY
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151F35",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#151F35",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#AAB1C2",
    marginTop: 14,
    fontSize: 14,
  },

  header: {
    height: 95,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerSpace: {
    width: 48,
  },

  headerTitle: {
    color: "#FFF4D8",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 2.3,
  },

  headerSubtitleRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  headerSubtitle: {
    color: "#D7B56D",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginHorizontal: 9,
  },

  smallLine: {
    width: 20,
    height: 1,
    backgroundColor: "#9B824D",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },

  imageFrame: {
    width: "100%",
    height: 390,
    marginTop: 15,
    borderRadius: 28,
    padding: 4,
    borderWidth: 1,
    borderColor: "#D7B56D",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  imageBadge: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(21,31,53,0.88)",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.65)",
  },

  imageBadgeText: {
    marginLeft: 7,
    color: "#FFF4D8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },

  noImage: {
    height: 190,
    marginTop: 15,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  noImageText: {
    marginTop: 10,
    color: "#AAB1C2",
  },

  decorRow: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
  },

  decorLine: {
    width: 50,
    height: 1,
    backgroundColor: "#9B824D",
  },

  diamond: {
    width: 10,
    height: 10,
    backgroundColor: "#D7B56D",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 12,
  },

  sectionLabel: {
    marginTop: 14,
    color: "#D7B56D",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },

  title: {
    marginTop: 9,
    color: "#FFF4D8",
    fontSize: 30,
    fontWeight: "800",
  },

  description: {
    marginTop: 7,
    color: "#9DA6BA",
    fontSize: 14,
    lineHeight: 21,
  },

  inputCard: {
    marginTop: 25,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#1B2740",
    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.25)",
  },

  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  inputLabel: {
    marginLeft: 8,
    color: "#D7B56D",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  input: {
    minHeight: 120,
    color: "#F4F1E8",
    fontSize: 16,
    lineHeight: 24,
  },

  characterCount: {
    alignSelf: "flex-end",
    color: "#737D93",
    fontSize: 11,
    marginTop: 7,
  },

  saveButton: {
    height: 58,
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: "#D7B56D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    marginLeft: 9,
    color: "#151F35",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  footerText: {
    marginTop: 28,
    textAlign: "center",
    color: "#626C82",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
  },
});