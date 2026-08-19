import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { db, auth } from "../firebase";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";

export default function CreatePost({ navigation }) {

  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // ================================
  // PICK IMAGE
  // ================================

  const pickImage = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow gallery access to choose a photo."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };


  // ================================
  // CLOUDINARY UPLOAD
  // ================================

  const uploadToCloudinary = async (imageUri) => {

    const data = new FormData();

    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "moment.jpg",
    });

    data.append(
      "upload_preset",
      "moments_upload"
    );

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/kn56xivr/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.message ||
        "Image upload failed."
      );
    }

    return result.secure_url;
  };


  // ================================
  // CREATE MOMENT
  // ================================

  const handleSubmit = async () => {

    if (loading) return;

    if (!caption.trim() && !imageUrl) {
      Alert.alert(
        "Create a Moment",
        "Add a photo or write something first."
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Login required",
        "Please login before creating a Moment."
      );
      return;
    }

    setLoading(true);

    try {

      // Get user profile
      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userDoc.exists()) {
        throw new Error(
          "User profile not found."
        );
      }

      const userData = userDoc.data();

      // Upload image
      const uploadedImage = imageUrl
        ? await uploadToCloudinary(imageUrl)
        : "";

      // Create post
      await addDoc(
        collection(db, "posts"),
        {
          userId: user.uid,

          userName:
            userData.name || "Unknown User",

          userPhoto:
            userData.photoURL || null,

          caption: caption.trim(),

          imageUrl: uploadedImage,

          createdAt: Timestamp.now(),

          likes: 0,

          likedBy: [],

          comments: 0,

          savedBy: [],
        }
      );

      setLoading(false);

      Alert.alert(
        "Moment Created ❤️",
        "Your Moment has been shared successfully!",
        [
          {
            text: "View Moment",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );

    } catch (error) {

      console.log(
        "CREATE MOMENT ERROR:",
        error
      );

      setLoading(false);

      Alert.alert(
        "Unable to create Moment",
        error.message ||
          "Something went wrong. Please try again."
      );
    }
  };


  // ================================
  // SCREEN
  // ================================

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color="#2C241F"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Create Moment
        </Text>

        <View style={{ width: 42 }} />

      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* INTRO */}

        <View style={styles.intro}>

          <Text style={styles.smallTitle}>
            SHARE A MOMENT
          </Text>

          <Text style={styles.mainTitle}>
            What's on your mind?
          </Text>

          <Text style={styles.subtitle}>
            Share something meaningful
            with the Moments community.
          </Text>

        </View>


        {/* CAPTION */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Your Moment
          </Text>

          <View style={styles.captionBox}>

            <TextInput
              placeholder="Write something..."
              placeholderTextColor="#A59D96"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={500}
              textAlignVertical="top"
              style={styles.input}
            />

            <Text style={styles.characterCount}>
              {caption.length}/500
            </Text>

          </View>

        </View>


        {/* PHOTO */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Add a Photo
            </Text>

            <Text style={styles.optional}>
              Optional
            </Text>

          </View>


          {!imageUrl ? (

            <TouchableOpacity
              style={styles.photoPicker}
              onPress={pickImage}
              activeOpacity={0.8}
            >

              <View style={styles.photoIconCircle}>

                <Ionicons
                  name="camera-outline"
                  size={30}
                  color="#8A6330"
                />

              </View>

              <Text style={styles.photoTitle}>
                Choose from Gallery
              </Text>

              <Text style={styles.photoSubtitle}>
                Add a photo to your Moment
              </Text>

            </TouchableOpacity>

          ) : (

            <View style={styles.previewContainer}>

              <Image
                source={{ uri: imageUrl }}
                style={styles.previewImage}
              />

              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() =>
                  setImageUrl("")
                }
              >

                <Ionicons
                  name="close"
                  size={22}
                  color="#FFFFFF"
                />

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={pickImage}
              >

                <Ionicons
                  name="images-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.changePhotoText}>
                  Change Photo
                </Text>

              </TouchableOpacity>

            </View>

          )}

        </View>


        {/* VISIBILITY */}

        <View style={styles.visibilityCard}>

          <View style={styles.visibilityIcon}>

            <Ionicons
              name="globe-outline"
              size={23}
              color="#6E5135"
            />

          </View>

          <View style={{ flex: 1 }}>

            <Text style={styles.visibilityTitle}>
              Public Moment
            </Text>

            <Text style={styles.visibilityText}>
              Anyone in the Moments community
              can see this.
            </Text>

          </View>

          <Ionicons
            name="checkmark-circle"
            size={24}
            color="#8A6330"
          />

        </View>


        {/* SHARE BUTTON */}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
          style={[
            styles.shareButton,
            loading && {
              opacity: 0.65,
            },
          ]}
        >

          {loading ? (

            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />

          ) : (

            <>
              <Ionicons
                name="heart-outline"
                size={22}
                color="#FFFFFF"
              />

              <Text style={styles.shareButtonText}>
                Share Moment
              </Text>
            </>

          )}

        </TouchableOpacity>


        <Text style={styles.bottomText}>
          Every Moment can become a memory. ❤️
        </Text>

      </ScrollView>

    </SafeAreaView>
  );
}


// ======================================
// STYLES
// ======================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE8E2",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C241F",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  intro: {
    marginBottom: 24,
  },

  smallTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#A07845",
    marginBottom: 7,
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C241F",
  },

  subtitle: {
    fontSize: 15,
    color: "#827870",
    lineHeight: 21,
    marginTop: 6,
  },

  section: {
    marginBottom: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#332A25",
    marginBottom: 9,
  },

  optional: {
    fontSize: 12,
    color: "#9A918A",
    marginBottom: 9,
  },

  captionBox: {
    minHeight: 150,
    backgroundColor: "#FBF7F2",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8DED2",
    padding: 14,
  },

  input: {
    flex: 1,
    minHeight: 110,
    fontSize: 17,
    color: "#2C241F",
    lineHeight: 24,
  },

  characterCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#9A918A",
  },

  photoPicker: {
    minHeight: 180,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E2D5C6",
    borderStyle: "dashed",
    backgroundColor: "#FCF9F5",
    alignItems: "center",
    justifyContent: "center",
  },

  photoIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F0E4D4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  photoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#46382E",
  },

  photoSubtitle: {
    fontSize: 13,
    color: "#91867D",
    marginTop: 4,
  },

  previewContainer: {
    height: 270,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F4F0EC",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  changePhotoButton: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 18,
  },

  changePhotoText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  visibilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F2EA",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E8DCCE",
    padding: 14,
    marginBottom: 24,
  },

  visibilityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEDFCB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  visibilityTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3C3028",
  },

  visibilityText: {
    fontSize: 12,
    color: "#827870",
    marginTop: 3,
    lineHeight: 17,
    paddingRight: 5,
  },

  shareButton: {
    height: 55,
    borderRadius: 28,
    backgroundColor: "#2C241F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 8,
  },

  bottomText: {
    textAlign: "center",
    color: "#9A918A",
    fontSize: 12,
    marginTop: 15,
  },

});