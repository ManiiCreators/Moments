import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { db, auth } from "../firebase";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";

export default function CreateImpact({ navigation }) {
  const [action, setAction] = useState("");
  const [story, setStory] = useState("");
  const [location, setLocation] = useState("");
  const [peopleHelped, setPeopleHelped] = useState("");
  const [category, setCategory] = useState("Helping Others");

  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    "Helping Others",
    "Environment",
    "Education",
    "Community",
    "Food & Donation",
    "Animals",
    "Other",
  ];

  // ==========================================
  // PICK IMAGE
  // ==========================================

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow gallery access to add a photo."
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
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("IMAGE PICK ERROR:", error);

      Alert.alert(
        "Unable to select photo",
        "Please try again."
      );
    }
  };

  // ==========================================
  // SHARE IMPACT
  // ==========================================

  const handleShareImpact = async () => {
    if (loading) return;

    const currentUser = auth.currentUser;

    // ------------------------------------------
    // LOGIN CHECK
    // ------------------------------------------

    if (!currentUser) {
      Alert.alert(
        "Login Required",
        "Please login before sharing an Impact."
      );
      return;
    }

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!action.trim()) {
      Alert.alert(
        "Tell us your action",
        "Please describe what you did."
      );
      return;
    }

    if (!story.trim()) {
      Alert.alert(
        "Tell your story",
        "Please share a little more about your Impact."
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        "Add a location",
        "Please tell us where this Impact happened."
      );
      return;
    }

    setLoading(true);

    try {
      // ----------------------------------------
      // GET USER PROFILE
      // ----------------------------------------

      const userRef = doc(
        db,
        "users",
        currentUser.uid
      );

      const userSnapshot =
        await getDoc(userRef);

      if (!userSnapshot.exists()) {
        throw new Error(
          "Your Moments profile could not be found."
        );
      }

      const userData =
        userSnapshot.data();

      // ----------------------------------------
      // SAVE IMPACT
      // ----------------------------------------

      const impactData = {
        userId: currentUser.uid,

        userName:
          userData.name || "Unknown User",

        userPhoto:
          userData.photoURL || "",

        action:
          action.trim(),

        story:
          story.trim(),

        location:
          location.trim(),

        category:
          category,

        peopleHelped:
          peopleHelped.trim() || "0",

        // Photo will be connected
        // after Firestore testing.
        imageUrl: "",

        // Future interaction fields
        likes: 0,

        likedBy: [],

        comments: 0,

        savedBy: [],

        // Server-side creation time
        createdAt:
          serverTimestamp(),
      };

      const impactRef =
        await addDoc(
          collection(db, "impacts"),
          impactData
        );

      console.log(
        "IMPACT CREATED:",
        impactRef.id
      );

      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      setLoading(false);

      Alert.alert(
        "Impact Shared ❤️",
        "Your good action has been added to the Moments community.",
        [
          {
            text: "Done",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );

    } catch (error) {
      console.log(
        "CREATE IMPACT ERROR:",
        error
      );

      setLoading(false);

      Alert.alert(
        "Unable to share Impact",
        error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // ==========================================
  // SCREEN
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ======================================
            HEADER
        ====================================== */}

        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={25}
              color="#241E1A"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Create Impact
          </Text>

          <View style={{ width: 42 }} />

        </View>


        {/* ======================================
            HERO
        ====================================== */}

        <View style={styles.hero}>

          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>
              ❤️
            </Text>
          </View>

          <Text style={styles.heroSmall}>
            MAKE A DIFFERENCE
          </Text>

          <Text style={styles.heroTitle}>
            Every good action{"\n"}
            <Text style={styles.heroAccent}>
              matters.
            </Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Share something kind you did today.
            Your action might inspire someone
            else to do the same.
          </Text>

        </View>


        {/* ======================================
            1. ACTION
        ====================================== */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                1
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                What did you do?
              </Text>

              <Text style={styles.cardSubtitle}>
                Tell us about your good action
              </Text>
            </View>

          </View>

          <TextInput
            style={styles.input}
            placeholder="Example: I helped an elderly person carry groceries."
            placeholderTextColor="#A59E98"
            value={action}
            onChangeText={setAction}
            multiline
            maxLength={250}
          />

          <Text style={styles.counter}>
            {action.length}/250
          </Text>

        </View>


        {/* ======================================
            2. STORY
        ====================================== */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                2
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Tell your story
              </Text>

              <Text style={styles.cardSubtitle}>
                What happened?
              </Text>
            </View>

          </View>

          <TextInput
            style={[
              styles.input,
              styles.storyInput,
            ]}
            placeholder="Share what happened and how it made you feel..."
            placeholderTextColor="#A59E98"
            value={story}
            onChangeText={setStory}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />

          <Text style={styles.counter}>
            {story.length}/1000
          </Text>

        </View>


        {/* ======================================
            3. CATEGORY
        ====================================== */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                3
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                What kind of Impact?
              </Text>

              <Text style={styles.cardSubtitle}>
                Choose a category
              </Text>
            </View>

          </View>

          <View style={styles.categoryContainer}>

            {categories.map((item) => {

              const selected =
                category === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() =>
                    setCategory(item)
                  }
                  style={[
                    styles.category,
                    selected &&
                      styles.categorySelected,
                  ]}
                >

                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>

                </TouchableOpacity>
              );
            })}

          </View>

        </View>


        {/* ======================================
            4. LOCATION
        ====================================== */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                4
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Where did it happen?
              </Text>

              <Text style={styles.cardSubtitle}>
                Help people discover local Impact
              </Text>
            </View>

          </View>

          <View style={styles.inputWithIcon}>

            <Ionicons
              name="location-outline"
              size={22}
              color="#8A6330"
            />

            <TextInput
              style={styles.locationInput}
              placeholder="Example: Kakinada"
              placeholderTextColor="#A59E98"
              value={location}
              onChangeText={setLocation}
            />

          </View>

        </View>


        {/* ======================================
            5. PEOPLE HELPED
        ====================================== */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                5
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                People helped
              </Text>

              <Text style={styles.cardSubtitle}>
                Optional — tell us the impact
              </Text>
            </View>

          </View>

          <View style={styles.inputWithIcon}>

            <Ionicons
              name="people-outline"
              size={22}
              color="#8A6330"
            />

            <TextInput
              style={styles.locationInput}
              placeholder="Example: 3"
              placeholderTextColor="#A59E98"
              value={peopleHelped}
              onChangeText={setPeopleHelped}
              keyboardType="number-pad"
            />

          </View>

        </View>


        {/* ======================================
            6. PHOTO
        ====================================== */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                6
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Add a photo
              </Text>

              <Text style={styles.cardSubtitle}>
                Optional — show your Impact
              </Text>
            </View>

          </View>

          {!imageUri ? (

            <TouchableOpacity
              style={styles.photoPicker}
              onPress={pickImage}
              activeOpacity={0.8}
            >

              <View style={styles.cameraCircle}>

                <Ionicons
                  name="camera-outline"
                  size={28}
                  color="#8A6330"
                />

              </View>

              <Text style={styles.photoTitle}>
                Choose from Gallery
              </Text>

              <Text style={styles.photoSubtitle}>
                Add a meaningful photo
              </Text>

            </TouchableOpacity>

          ) : (

            <View
              style={styles.previewContainer}
            >

              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
              />

              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() =>
                  setImageUri("")
                }
              >

                <Ionicons
                  name="close"
                  size={22}
                  color="#FFFFFF"
                />

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePhoto}
                onPress={pickImage}
              >

                <Ionicons
                  name="images-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.changePhotoText}
                >
                  Change Photo
                </Text>

              </TouchableOpacity>

            </View>
          )}

        </View>


        {/* ======================================
            VISIBILITY
        ====================================== */}

        <View style={styles.visibility}>

          <View style={styles.visibilityIcon}>

            <Ionicons
              name="globe-outline"
              size={22}
              color="#6E5135"
            />

          </View>

          <View style={{ flex: 1 }}>

            <Text style={styles.visibilityTitle}>
              Public Impact
            </Text>

            <Text style={styles.visibilityText}>
              Your Impact can inspire people
              throughout the Moments community.
            </Text>

          </View>

          <Ionicons
            name="checkmark-circle"
            size={25}
            color="#8A6330"
          />

        </View>


        {/* ======================================
            SHARE
        ====================================== */}

        <TouchableOpacity
          onPress={handleShareImpact}
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
              size="small"
              color="#FFFFFF"
            />

          ) : (

            <>
              <Ionicons
                name="heart"
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={styles.shareButtonText}
              >
                Share My Impact
              </Text>
            </>

          )}

        </TouchableOpacity>


        <Text style={styles.footer}>
          One small act can create a ripple
          of kindness. 🌱
        </Text>

      </ScrollView>

    </SafeAreaView>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F7F5",
  },

  content: {
    paddingBottom: 45,
  },


  // ==============================================
  // HEADER
  // ==============================================

  header: {
    height: 62,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE9E4",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F5F3F1",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C241F",
  },


  // ==============================================
  // HERO
  // ==============================================

  hero: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 28,
    paddingBottom: 24,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FCE8EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  heroEmoji: {
    fontSize: 29,
  },

  heroSmall: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#A07845",
    marginBottom: 7,
  },

  heroTitle: {
    textAlign: "center",
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "800",
    color: "#2C241F",
  },

  heroAccent: {
    color: "#E83263",
  },

  heroSubtitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#81776F",
    marginTop: 9,
  },


  // ==============================================
  // CARD
  // ==============================================

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 21,
    padding: 17,
    borderWidth: 1,
    borderColor: "#ECE6E0",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  numberCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F8E9DC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  numberText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#8A6330",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#332A25",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#938981",
    marginTop: 2,
  },


  // ==============================================
  // INPUTS
  // ==============================================

  input: {
    minHeight: 65,
    backgroundColor: "#FBF9F7",
    borderWidth: 1,
    borderColor: "#E7DED5",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2C241F",
  },

  storyInput: {
    minHeight: 125,
  },

  counter: {
    textAlign: "right",
    fontSize: 10,
    color: "#A49A92",
    marginTop: 5,
  },


  // ==============================================
  // CATEGORY
  // ==============================================

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  category: {
    borderWidth: 1,
    borderColor: "#E4DBD3",
    backgroundColor: "#FBF9F7",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginRight: 7,
    marginBottom: 8,
  },

  categorySelected: {
    backgroundColor: "#E83263",
    borderColor: "#E83263",
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#665C55",
  },

  categoryTextSelected: {
    color: "#FFFFFF",
  },


  // ==============================================
  // LOCATION / PEOPLE
  // ==============================================

  inputWithIcon: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBF9F7",
    borderWidth: 1,
    borderColor: "#E7DED5",
    borderRadius: 15,
    paddingHorizontal: 14,
  },

  locationInput: {
    flex: 1,
    fontSize: 15,
    color: "#2C241F",
    marginLeft: 10,
  },


  // ==============================================
  // PHOTO
  // ==============================================

  photoPicker: {
    height: 175,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#DCCDBD",
    borderRadius: 17,
    backgroundColor: "#FCF9F5",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F0E3D4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  photoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#46382E",
  },

  photoSubtitle: {
    fontSize: 12,
    color: "#948A82",
    marginTop: 4,
  },

  previewContainer: {
    height: 250,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#F2EEEA",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  removePhoto: {
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

  changePhoto: {
    position: "absolute",
    bottom: 11,
    left: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
  },

  changePhotoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },


  // ==============================================
  // VISIBILITY
  // ==============================================

  visibility: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#F8F0E7",
    borderWidth: 1,
    borderColor: "#E9DCCE",
    borderRadius: 19,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  visibilityIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#EEDFCB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  visibilityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3C3028",
  },

  visibilityText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#827870",
    marginTop: 3,
    paddingRight: 5,
  },


  // ==============================================
  // SHARE
  // ==============================================

  shareButton: {
    height: 58,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: "#E83263",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 8,
  },


  // ==============================================
  // FOOTER
  // ==============================================

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#9A918A",
    marginTop: 14,
    paddingHorizontal: 25,
  },

});