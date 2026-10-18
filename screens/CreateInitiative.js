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

import { Ionicons } from "@expo/vector-icons";

import { db, auth } from "../firebase";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import * as ImagePicker from "expo-image-picker";

export default function CreateInitiative({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Helping Others");
  const [location, setLocation] = useState("");
  const [goal, setGoal] = useState("");
  const [peopleTarget, setPeopleTarget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [ongoing, setOngoing] = useState(true);
  const [endDate, setEndDate] = useState("");

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

  // ======================================================
  // PICK COVER PHOTO
  // ======================================================

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow gallery access to add a cover photo."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 1,
        });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("INITIATIVE IMAGE ERROR:", error);

      Alert.alert(
        "Unable to select photo",
        "Please try again."
      );
    }
  };

  // ======================================================
  // CREATE INITIATIVE
  // ======================================================

  const handleCreateInitiative = async () => {
    if (loading) return;

    const currentUser = auth.currentUser;

    // --------------------------------------------------
    // LOGIN CHECK
    // --------------------------------------------------

    if (!currentUser) {
      Alert.alert(
        "Login Required",
        "Please login before creating an Initiative."
      );
      return;
    }

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!title.trim()) {
      Alert.alert(
        "Add a title",
        "Please give your Initiative a meaningful title."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Tell us about it",
        "Please describe your Initiative."
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        "Add a location",
        "Please tell us where this Initiative will happen."
      );
      return;
    }

    if (!goal.trim()) {
      Alert.alert(
        "Add a goal",
        "Please tell people what you want to achieve."
      );
      return;
    }

    if (!peopleTarget.trim()) {
      Alert.alert(
        "Add your target",
        "Please tell us approximately how many people you want to help."
      );
      return;
    }

    if (!startDate.trim()) {
      Alert.alert(
        "Add a start date",
        "Please enter when your Initiative starts."
      );
      return;
    }

    if (!ongoing && !endDate.trim()) {
      Alert.alert(
        "Add an end date",
        "Please enter an end date or choose Ongoing."
      );
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------
      // GET USER PROFILE
      // ------------------------------------------------

      const userRef = doc(
        db,
        "users",
        currentUser.uid
      );

      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        throw new Error(
          "Your Moments profile could not be found."
        );
      }

      const userData = userSnapshot.data();

      // ------------------------------------------------
      // SAVE INITIATIVE
      // ------------------------------------------------

      const initiativeData = {
        userId: currentUser.uid,

        userName:
          userData.name || "Unknown User",

        userPhoto:
          userData.photoURL || "",

        title: title.trim(),

        description:
          description.trim(),

        category,

        location:
          location.trim(),

        goal:
          goal.trim(),

        peopleTarget:
          peopleTarget.trim(),

        peopleHelped: 0,

        joinedCount: 0,

        imageUrl: "",

        startDate:
          startDate.trim(),

        endDate:
          ongoing ? "" : endDate.trim(),

        ongoing,

        status: "active",

        likes: 0,

        likedBy: [],

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      };

      const initiativeRef =
        await addDoc(
          collection(db, "initiatives"),
          initiativeData
        );

      console.log(
        "INITIATIVE CREATED:",
        initiativeRef.id
      );

      setLoading(false);

      // ------------------------------------------------
      // SUCCESS
      // ------------------------------------------------

      Alert.alert(
  "Initiative Created 🌱",
  "Your Initiative is now part of Moments.",
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
        "CREATE INITIATIVE ERROR:",
        error
      );

      setLoading(false);

      Alert.alert(
        "Unable to create Initiative",
        error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // ======================================================
  // SCREEN
  // ======================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={25}
              color="#29251F"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Start an Initiative
          </Text>

          <View style={{ width: 42 }} />

        </View>


        {/* =================================================
            HERO
        ================================================= */}

        <View style={styles.hero}>

          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>
              🌱
            </Text>
          </View>

          <Text style={styles.heroSmall}>
            CREATE CHANGE
          </Text>

          <Text style={styles.heroTitle}>
            Turn an idea into{"\n"}
            <Text style={styles.heroAccent}>
              meaningful change.
            </Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Start something meaningful and
            invite others to make a difference
            together.
          </Text>

        </View>


        {/* =================================================
            COVER PHOTO
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                1
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Cover photo
              </Text>

              <Text style={styles.cardSubtitle}>
                Give your Initiative a face
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
                  color="#53745C"
                />

              </View>

              <Text style={styles.photoTitle}>
                Choose a cover photo
              </Text>

              <Text style={styles.photoSubtitle}>
                A meaningful image works best
              </Text>

            </TouchableOpacity>

          ) : (

            <View style={styles.previewContainer}>

              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
              />

              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => setImageUri("")}
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

                <Text style={styles.changePhotoText}>
                  Change Photo
                </Text>

              </TouchableOpacity>

            </View>

          )}

        </View>


        {/* =================================================
            TITLE
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                2
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Initiative title
              </Text>

              <Text style={styles.cardSubtitle}>
                Give your idea a memorable name
              </Text>
            </View>

          </View>

          <TextInput
            style={styles.input}
            placeholder="Example: Community Food Drive"
            placeholderTextColor="#A59E98"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          <Text style={styles.counter}>
            {title.length}/80
          </Text>

        </View>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                3
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                About your Initiative
              </Text>

              <Text style={styles.cardSubtitle}>
                Tell people why it matters
              </Text>
            </View>

          </View>

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
            placeholder="Explain what you want to achieve and how people can help..."
            placeholderTextColor="#A59E98"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />

          <Text style={styles.counter}>
            {description.length}/1000
          </Text>

        </View>


        {/* =================================================
            CATEGORY
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                4
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Category
              </Text>

              <Text style={styles.cardSubtitle}>
                What kind of change?
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


        {/* =================================================
            LOCATION
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                5
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Where will it happen?
              </Text>

              <Text style={styles.cardSubtitle}>
                Help people discover local Initiatives
              </Text>
            </View>

          </View>

          <View style={styles.inputWithIcon}>

            <Ionicons
              name="location-outline"
              size={22}
              color="#53745C"
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


        {/* =================================================
            GOAL
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                6
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                What's your goal?
              </Text>

              <Text style={styles.cardSubtitle}>
                Describe what success looks like
              </Text>
            </View>

          </View>

          <TextInput
            style={[
              styles.input,
              styles.smallInput,
            ]}
            placeholder="Example: Provide meals for 100 people"
            placeholderTextColor="#A59E98"
            value={goal}
            onChangeText={setGoal}
            multiline
            maxLength={200}
          />

        </View>


        {/* =================================================
            PEOPLE TARGET
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                7
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                People you want to help
              </Text>

              <Text style={styles.cardSubtitle}>
                Set an approximate target
              </Text>
            </View>

          </View>

          <View style={styles.inputWithIcon}>

            <Ionicons
              name="people-outline"
              size={22}
              color="#53745C"
            />

            <TextInput
              style={styles.locationInput}
              placeholder="Example: 100"
              placeholderTextColor="#A59E98"
              value={peopleTarget}
              onChangeText={setPeopleTarget}
              keyboardType="number-pad"
            />

          </View>

        </View>


        {/* =================================================
            START DATE
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                8
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                When will it start?
              </Text>

              <Text style={styles.cardSubtitle}>
                Enter your start date
              </Text>
            </View>

          </View>

          <View style={styles.inputWithIcon}>

            <Ionicons
              name="calendar-outline"
              size={22}
              color="#53745C"
            />

            <TextInput
              style={styles.locationInput}
              placeholder="Example: 25 September 2026"
              placeholderTextColor="#A59E98"
              value={startDate}
              onChangeText={setStartDate}
            />

          </View>

        </View>


        {/* =================================================
            DURATION
        ================================================= */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>
                9
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Duration
              </Text>

              <Text style={styles.cardSubtitle}>
                Is this Initiative ongoing?
              </Text>
            </View>

          </View>


          <TouchableOpacity
            style={[
              styles.durationOption,
              ongoing &&
                styles.durationSelected,
            ]}
            onPress={() => setOngoing(true)}
          >

            <View
              style={[
                styles.radio,
                ongoing &&
                  styles.radioSelected,
              ]}
            >
              {ongoing && (
                <View style={styles.radioDot} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.durationTitle}>
                Ongoing
              </Text>

              <Text style={styles.durationText}>
                Keep the Initiative active until you complete it.
              </Text>
            </View>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.durationOption,
              !ongoing &&
                styles.durationSelected,
            ]}
            onPress={() => setOngoing(false)}
          >

            <View
              style={[
                styles.radio,
                !ongoing &&
                  styles.radioSelected,
              ]}
            >
              {!ongoing && (
                <View style={styles.radioDot} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.durationTitle}>
                Set an end date
              </Text>

              <Text style={styles.durationText}>
                Choose when the Initiative should finish.
              </Text>
            </View>

          </TouchableOpacity>


          {!ongoing && (

            <View style={[
              styles.inputWithIcon,
              { marginTop: 12 },
            ]}>

              <Ionicons
                name="calendar-outline"
                size={22}
                color="#53745C"
              />

              <TextInput
                style={styles.locationInput}
                placeholder="Example: 30 September 2026"
                placeholderTextColor="#A59E98"
                value={endDate}
                onChangeText={setEndDate}
              />

            </View>

          )}

        </View>


        {/* =================================================
            PUBLIC INFO
        ================================================= */}

        <View style={styles.visibility}>

          <View style={styles.visibilityIcon}>

            <Ionicons
              name="earth-outline"
              size={22}
              color="#53745C"
            />

          </View>

          <View style={{ flex: 1 }}>

            <Text style={styles.visibilityTitle}>
              Public Initiative
            </Text>

            <Text style={styles.visibilityText}>
              Your Initiative can be discovered
              by people in the Moments community.
            </Text>

          </View>

          <Ionicons
            name="checkmark-circle"
            size={25}
            color="#53745C"
          />

        </View>


        {/* =================================================
            CREATE BUTTON
        ================================================= */}

        <TouchableOpacity
          onPress={handleCreateInitiative}
          disabled={loading}
          activeOpacity={0.85}
          style={[
            styles.createButton,
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
                name="leaf"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.createButtonText}>
                Start My Initiative
              </Text>
            </>

          )}

        </TouchableOpacity>


        <Text style={styles.footer}>
          One idea can become a movement. 🌱
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
    backgroundColor: "#F7F7F3",
  },

  content: {
    paddingBottom: 50,
  },


  // ====================================================
  // HEADER
  // ====================================================

  header: {
    height: 62,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E8E1",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F2ED",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#29251F",
  },


  // ====================================================
  // HERO
  // ====================================================

  hero: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 29,
    paddingBottom: 25,
  },

  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F0E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  heroEmoji: {
    fontSize: 31,
  },

  heroSmall: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#5D7964",
    marginBottom: 7,
  },

  heroTitle: {
    textAlign: "center",
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "800",
    color: "#29251F",
  },

  heroAccent: {
    color: "#53745C",
  },

  heroSubtitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#7C817A",
    marginTop: 10,
  },


  // ====================================================
  // CARD
  // ====================================================

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 21,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E5E7DF",
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
    backgroundColor: "#E8F0E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  numberText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#53745C",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#302C27",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#8A8E87",
    marginTop: 2,
  },


  // ====================================================
  // INPUTS
  // ====================================================

  input: {
    minHeight: 58,
    backgroundColor: "#FAFAF7",
    borderWidth: 1,
    borderColor: "#DEE1D8",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#29251F",
  },

  descriptionInput: {
    minHeight: 125,
  },

  smallInput: {
    minHeight: 70,
  },

  counter: {
    textAlign: "right",
    fontSize: 10,
    color: "#A0A49C",
    marginTop: 5,
  },


  // ====================================================
  // PHOTO
  // ====================================================

  photoPicker: {
    height: 180,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C9D5CA",
    borderRadius: 17,
    backgroundColor: "#F8FAF7",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#E8F0E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  photoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#405445",
  },

  photoSubtitle: {
    fontSize: 12,
    color: "#8D958D",
    marginTop: 4,
  },

  previewContainer: {
    height: 250,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#EFF1ED",
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


  // ====================================================
  // CATEGORY
  // ====================================================

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  category: {
    borderWidth: 1,
    borderColor: "#DCE1D9",
    backgroundColor: "#FAFAF7",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginRight: 7,
    marginBottom: 8,
  },

  categorySelected: {
    backgroundColor: "#53745C",
    borderColor: "#53745C",
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#697067",
  },

  categoryTextSelected: {
    color: "#FFFFFF",
  },


  // ====================================================
  // LOCATION / PEOPLE
  // ====================================================

  inputWithIcon: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAF7",
    borderWidth: 1,
    borderColor: "#DEE1D8",
    borderRadius: 15,
    paddingHorizontal: 14,
  },

  locationInput: {
    flex: 1,
    fontSize: 15,
    color: "#29251F",
    marginLeft: 10,
  },


  // ====================================================
  // DURATION
  // ====================================================

  durationOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E3DC",
    backgroundColor: "#FAFAF7",
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
  },

  durationSelected: {
    borderColor: "#B8C9BA",
    backgroundColor: "#F3F7F3",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#A8AEA6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  radioSelected: {
    borderColor: "#53745C",
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#53745C",
  },

  durationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#383F38",
  },

  durationText: {
    fontSize: 11,
    color: "#858C84",
    lineHeight: 16,
    marginTop: 2,
  },


  // ====================================================
  // VISIBILITY
  // ====================================================

  visibility: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#EDF4EE",
    borderWidth: 1,
    borderColor: "#D6E3D7",
    borderRadius: 19,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  visibilityIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#DDEADF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  visibilityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#354638",
  },

  visibilityText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#718073",
    marginTop: 3,
    paddingRight: 5,
  },


  // ====================================================
  // CREATE BUTTON
  // ====================================================

  createButton: {
    height: 58,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: "#53745C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 8,
  },


  // ====================================================
  // FOOTER
  // ====================================================

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#92988F",
    marginTop: 14,
    paddingHorizontal: 25,
  },

});