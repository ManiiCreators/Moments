import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,


  ActivityIndicator,
  Dimensions,
} from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function Profile({ navigation }) {
  const [loading, setLoading] = useState(false);

const [name, setName] = useState("Mani");

const [username, setUsername] = useState("@moments.creator");

const [bio, setBio] = useState(
  "Creating moments that make a difference. 🚀"
);

const [location, setLocation] = useState(
  "Kakinada, India"
);
  const [profileImage, setProfileImage] = useState(null);

  const [myMoments, setMyMoments] = useState([]);

  const defaultCover =
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=90";

  const [coverImage, setCoverImage] =
    useState(defaultCover);

    const [profile, setProfile] = useState({
  name: "Mani",
  username: "@mani.creates",
  bio: "Moments Creator 🚀",
  location: "Kakinada, India",
});


const pickProfileImage = async () => {
  try {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) {
      return;
    }

  const selectedImage = result.assets[0];

// Show image immediately
setProfileImage(selectedImage.uri);

// Upload image to Cloudinary
const uploadedImageUrl = await uploadToCloudinary(
  selectedImage.uri
);

if (!uploadedImageUrl) {
  throw new Error("Image upload failed. No URL received.");
}

// Save Cloudinary URL to Firestore
const docRef = doc(
  db,
  "users",
  auth.currentUser.uid
);

await updateDoc(docRef, {
  photoURL: uploadedImageUrl,
});

// Update profile image with permanent URL
setProfileImage(uploadedImageUrl);

Alert.alert(
  "Success",
  "Profile image updated successfully!"
);
  } catch (error) {
    console.log("Profile image error:", error);

    Alert.alert(
      "Error",
      error.message || "Unable to select profile picture."
    );
  }
};

  /* ================= LOAD PROFILE ================= */

useFocusEffect(
  useCallback(() => {
    loadProfile();
    loadMyMoments();
  }, [])
);

const loadProfile = async () => {
  try {
    if (!auth.currentUser) return;

    const docRef = doc(
      db,
      "users",
      auth.currentUser.uid
    );

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      setName(
        data.name || "Mani"
      );

      setUsername(
        data.username || "@moments.creator"
      );

      setBio(
        data.bio ||
          "Creating moments that make a difference. 🚀"
      );

      setLocation(
        data.location || "Kakinada, India"
      );

      setProfileImage(
        data.photoURL || null
      );

      setCoverImage(
        data.coverURL ||
          "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80"
      );
    }
  } catch (error) {
    console.log(
      "Load profile error:",
      error
    );
  }
};

 /* ================= CLOUDINARY UPLOAD ================= */

const uploadToCloudinary = async (imageUri) => {
  try {
    console.log("Uploading image URI:", imageUri);

   const uploadUrl =
  "https://api.cloudinary.com/v1_1/kn56xivr/image/upload";

    const uploadResult = await FileSystem.uploadAsync(
      uploadUrl,
      imageUri,
      {
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file",
        parameters: {
          upload_preset: "moments_upload",
        },
      }
    );

    console.log("Cloudinary status:", uploadResult.status);
    console.log("Cloudinary response:", uploadResult.body);

    const result = JSON.parse(uploadResult.body);

    if (uploadResult.status !== 200) {
      throw new Error(
        result?.error?.message || "Image upload failed"
      );
    }

    if (!result?.secure_url) {
      throw new Error("Cloudinary URL not received");
    }

    return result.secure_url;

  } catch (error) {
    console.log("Cloudinary upload error:", error);
    throw error;
  }
};

  /* ================= PICK COVER IMAGE ================= */

  const pickCoverImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const localImageUri = result.assets[0].uri;

    console.log("Selected cover image:", localImageUri);

    const imageUrl = await uploadToCloudinary(localImageUri);

    console.log("Uploaded cover URL:", imageUrl);

    if (imageUrl) {
      setCoverImage(imageUrl);

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          coverURL: imageUrl,
        },
        { merge: true }
      );

      Alert.alert(
        "Success",
        "Cover image updated successfully!"
      );
    }
  } catch (error) {
    console.log("Cover image error:", error);

    Alert.alert(
      "Error",
      error.message || "Unable to update cover image."
    );
  }
};

  /* ================= SAVE PROFILE ================= */

  const saveProfile = async () => {
    if (loading) return;

    if (!auth.currentUser) {
      Alert.alert(
        "Error",
        "Please login again."
      );
      return;
    }

    setLoading(true);

    try {
      const uploadedProfileImage =
        await uploadToCloudinary(
          profileImage
        );

      const uploadedCoverImage =
        await uploadToCloudinary(
          coverImage
        );

      await setDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid
        ),
        {
          name,
          username,
          bio,
          photoURL:
            uploadedProfileImage,
          coverURL:
            uploadedCoverImage,
        },
        {
          merge: true,
        }
      );

      setProfileImage(
        uploadedProfileImage
      );

      setCoverImage(
        uploadedCoverImage
      );

      Alert.alert(
        "Success 🎉",
        "Profile saved successfully!"
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

/* ================= LOADMYMOMENTS ================= */

const loadMyMoments = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "posts"),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);

    const moments = querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    setMyMoments(moments);

    console.log("MY MOMENTS:", moments);
  } catch (error) {
    console.log("LOAD MY MOMENTS ERROR:", error);
  }
};


  /* ================= LOGOUT ================= */

  const logout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert(
                "Error",
                error.message
              );
            }
          },
        },
      ]
    );
  };

  /* ================= MENU ITEM ================= */

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconBox}>
        <Ionicons
          name={icon}
          size={22}
          color="#27364F"
        />
      </View>

      <View style={styles.menuTextBox}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text
          style={styles.menuSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#94A3B8"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ================= COVER ================= */}

        <View style={styles.coverContainer}>
          <Image
            source={{
              uri: coverImage,
            }}
            style={styles.coverImage}
          />

          <View style={styles.coverOverlay} />

          {/* CHANGE COVER */}

          <TouchableOpacity
            style={
              styles.changeCoverButton
            }
            onPress={pickCoverImage}
          >
            <Ionicons
              name="camera-outline"
              size={17}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.changeCoverText
              }
            >
              Change Cover
            </Text>
          </TouchableOpacity>

          {/* PROFILE IMAGE */}

          <TouchableOpacity
            style={
              styles.profileImageContainer
            }
            onPress={pickProfileImage}
          >
            <Image
              source={
                profileImage
                  ? {
                      uri: profileImage,
                    }
                  : require("../assets/icon.png")
              }
              style={styles.profileImage}
            />

            <View
              style={styles.cameraButton}
            >
              <Ionicons
                name="camera"
                size={17}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {/* EDIT PROFILE */}

          <TouchableOpacity
            style={
              styles.editProfileTopButton
            }
            onPress={() => navigation.navigate("EditProfile")}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#27364F"
                size="small"
              />
            ) : (
              <>
                <Ionicons
                  name="create-outline"
                  size={19}
                  color="#27364F"
                />

                <Text
                  style={
                    styles.editProfileTopText
                  }
                >
                  Edit Profile
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ================= PROFILE INFO ================= */}

        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {name}
          </Text>

          <Text style={styles.username}>
            {username}
          </Text>

          <View
            style={styles.creatorBadge}
          >
            <Text
              style={styles.creatorText}
            >
              Moments Creator 🚀
            </Text>
          </View>

          <Text style={styles.bio}>
            “{bio}”
          </Text>

          <View
            style={styles.locationRow}
          >
            <View
              style={styles.locationItem}
            >
              <Ionicons
                name="location"
                size={15}
                color="#64748B"
              />

              <Text
            style={styles.locationText}
            >
            {location}
            </Text>
            </View>

            <View
              style={styles.verticalLine}
            />

            <View
              style={styles.locationItem}
            >
              <Ionicons
                name="calendar"
                size={14}
                color="#64748B"
              />

              <Text
                style={
                  styles.locationText
                }
              >
                Joined Jan 2024
              </Text>
            </View>
          </View>
        </View>

        {/* ================= STATS ================= */}

        <View style={styles.statsCard}>
          <TouchableOpacity
            style={styles.statItem}
          >
            <Ionicons
              name="bookmark"
              size={23}
              color="#E91E63"
            />

            <Text
              style={styles.statNumber}
            >
              24
            </Text>

            <Text
              style={styles.statLabel}
            >
              Moments
            </Text>
          </TouchableOpacity>

          <View
            style={styles.statDivider}
          />

          <TouchableOpacity
            style={styles.statItem}
          >
            <Ionicons
              name="people"
              size={24}
              color="#1976B9"
            />

            <Text
              style={styles.statNumber}
            >
              156
            </Text>

            <Text
              style={styles.statLabel}
            >
              Followers
            </Text>
          </TouchableOpacity>

          <View
            style={styles.statDivider}
          />

          <TouchableOpacity
            style={styles.statItem}
          >
            <Ionicons
              name="person-add"
              size={24}
              color="#1976B9"
            />

            <Text
              style={styles.statNumber}
            >
              120
            </Text>

            <Text
              style={styles.statLabel}
            >
              Following
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= YOUR IMPACT ================= */}

        <View style={styles.impactCard}>
          <View
            style={styles.impactMain}
          >
            <Text
              style={styles.impactPlant}
            >
              🌱
            </Text>

            <View>
              <Text
                style={
                  styles.impactSmallTitle
                }
              >
                Your Impact
              </Text>

              <Text
                style={styles.impactTitle}
              >
                Small actions.
              </Text>

              <Text
                style={styles.impactGreen}
              >
                Big change.
              </Text>
            </View>
          </View>

          <View
            style={styles.impactDivider}
          />

          <View
            style={styles.impactStats}
          >
            <View
              style={styles.impactStat}
            >
              <View
                style={styles.heartCircle}
              >
                <Text
                  style={
                    styles.impactEmoji
                  }
                >
                  ❤️
                </Text>
              </View>

              <Text
                style={
                  styles.impactNumber
                }
              >
                12
              </Text>

              <Text
                style={
                  styles.impactLabel
                }
              >
                Impacts
              </Text>
            </View>

            <View
              style={styles.impactStat}
            >
              <View
                style={styles.peopleCircle}
              >
                <Ionicons
                  name="people"
                  size={20}
                  color="#1976B9"
                />
              </View>

              <Text
                style={
                  styles.impactNumber
                }
              >
                48
              </Text>

              <Text
                style={
                  styles.impactLabel
                }
              >
                People Helped
              </Text>
            </View>

            <View
              style={styles.impactStat}
            >
              <View
                style={styles.leafCircle}
              >
                <Ionicons
                  name="leaf"
                  size={20}
                  color="#1E8B4C"
                />
              </View>

              <Text
                style={
                  styles.impactNumber
                }
              >
                5
              </Text>

              <Text
                style={
                  styles.impactLabel
                }
              >
                Initiatives
              </Text>
            </View>
          </View>
        </View>

        {/* ================= MY MOMENTS ================= */}

        <View
          style={styles.momentsHeader}
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              My Moments
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Snapshots that matter.
            </Text>
          </View>

          <TouchableOpacity
    onPress={() =>
        navigation.navigate("MyMoments", {
            moments: myMoments,
            selectedIndex: 0,
        })
    }
    >
    <Text style={styles.seeAll}>
        See All
    </Text>
    </TouchableOpacity>
        </View>

        <View style={styles.momentsRow}>
  {myMoments.slice(0, 2).map((moment, index) => (
  <TouchableOpacity
    key={moment.id}
    onPress={() =>
      navigation.navigate("MyMoments", {
        moments: myMoments,
        selectedIndex: index,
      })
    }
  >
    <Image
      source={{
        uri: moment.images?.[0] || moment.imageUrl,
      }}
      style={styles.momentImage}
    />
  </TouchableOpacity>
))}

  <TouchableOpacity
    style={styles.createMoment}
    onPress={() => navigation.navigate("CreatePost")}
  >
    <Ionicons name="add" size={32} color="#D62962" />
    <Text style={styles.createMomentText}>Create{"\n"}Moment</Text>
  </TouchableOpacity>
</View>

        {/* ================= MENU ================= */}

        <View style={styles.menuCard}>
          <MenuItem
            icon="bookmark-outline"
            title="Saved Moments"
            subtitle="Your favorite moments"
            onPress={() =>
              navigation.navigate(
                "SavedMoments"
              )
            }
          />

          <View
            style={styles.menuDivider}
          />

          <MenuItem
            icon="moon-outline"
            title="My Stories"
            subtitle="Replies and interactions"
            onPress={() =>
              navigation.navigate(
                "RepliesTest"
              )
            }
          />

          <View
            style={styles.menuDivider}
          />

          <MenuItem
            icon="lock-closed-outline"
            title="Privacy & Security"
            subtitle="Keep your account safe"
            onPress={() =>
              Alert.alert(
                "Privacy & Security",
                "Coming soon!"
              )
            }
          />

          <View
            style={styles.menuDivider}
          />

          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="App preferences"
            onPress={() =>
              Alert.alert(
                "Settings",
                "Coming soon!"
              )
            }
          />
        </View>

        {/* ================= LOGOUT ================= */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#D62962"
          />

          <Text
            style={styles.logoutText}
          >
            Log Out
          </Text>
        </TouchableOpacity>

        <View
          style={{ height: 100 }}
        />
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F5FA",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* COVER */

  coverContainer: {
    height: 315,
    position: "relative",
  },

  coverImage: {
    width: "100%",
    height: 255,
  },

  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 255,
    backgroundColor:
      "rgba(0,0,0,0.18)",
  },

  /* CHANGE COVER */

  changeCoverButton: {
    position: "absolute",
    right: 16,
    top: 195,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "rgba(0,0,0,0.65)",

    paddingHorizontal: 13,
    paddingVertical: 8,

    borderRadius: 20,
  },

  changeCoverText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  /* PROFILE IMAGE */

  profileImageContainer: {
    position: "absolute",

    bottom: 0,
    left: 22,

    width: 125,
    height: 125,

    borderRadius: 63,

    borderWidth: 5,
    borderColor: "#FFFFFF",

    backgroundColor: "#FFFFFF",

    elevation: 8,
  },

  profileImage: {
    width: "100%",
    height: "100%",

    borderRadius: 58,
  },

  /* PROFILE CAMERA */

  cameraButton: {
    position: "absolute",

    right: -4,
    bottom: 2,

    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#ED1F5F",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 3,
    borderColor: "#FFFFFF",

    elevation: 5,
  },

  /* EDIT PROFILE */

  editProfileTopButton: {
    position: "absolute",

    right: 16,
    top: 270,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 15,
    paddingVertical: 10,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: "#CBD5E1",

    elevation: 4,
  },

  editProfileTopText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#27364F",

    marginLeft: 6,
  },

  /* PROFILE INFO */

  profileInfo: {
    alignItems: "center",

    paddingHorizontal: 20,

    marginTop: 18,
  },

  name: {
    fontSize: 27,
    fontWeight: "800",
    color: "#1E2B42",
  },

  username: {
    fontSize: 16,
    color: "#667085",
    marginTop: 1,
  },

  creatorBadge: {
    backgroundColor: "#FCE4EC",

    paddingHorizontal: 12,
    paddingVertical: 5,

    borderRadius: 15,

    marginTop: 9,
  },

  creatorText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C2255C",
  },

  bio: {
    fontSize: 15,
    color: "#526074",

    textAlign: "center",

    marginTop: 10,

    lineHeight: 21,
  },

  locationRow: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 13,
  },

  locationItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },

  verticalLine: {
    width: 1,
    height: 18,

    backgroundColor: "#CBD5E1",

    marginHorizontal: 10,
  },

  /* STATS */

  statsCard: {
    flexDirection: "row",

    marginHorizontal: 18,
    marginTop: 22,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingVertical: 15,

    elevation: 3,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statDivider: {
    width: 1,
    height: 65,

    backgroundColor: "#E2E8F0",

    alignSelf: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",

    color: "#1E2B42",

    marginTop: 3,
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",

    marginTop: 2,
  },

  /* IMPACT */

  impactCard: {
    marginHorizontal: 18,
    marginTop: 18,

    borderRadius: 20,

    padding: 15,

    backgroundColor: "#F4FBF5",

    elevation: 2,
  },

  impactMain: {
    flexDirection: "row",
    alignItems: "center",
  },

  impactPlant: {
    fontSize: 42,
    marginRight: 9,
  },

  impactSmallTitle: {
    fontSize: 13,
    color: "#64748B",
  },

  impactTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },

  impactGreen: {
    fontSize: 20,
    fontWeight: "800",
    color: "#198754",
  },

  impactDivider: {
    height: 1,

    backgroundColor: "#DDEEE1",

    marginVertical: 12,
  },

  impactStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  impactStat: {
    alignItems: "center",
    flex: 1,
  },

  heartCircle: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#FCE4EC",

    justifyContent: "center",
    alignItems: "center",
  },

  peopleCircle: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#E3F2FD",

    justifyContent: "center",
    alignItems: "center",
  },

  leafCircle: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#E8F5E9",

    justifyContent: "center",
    alignItems: "center",
  },

  impactEmoji: {
    fontSize: 19,
  },

  impactNumber: {
    fontSize: 21,
    fontWeight: "800",

    color: "#1E2B42",

    marginTop: 3,
  },

  impactLabel: {
    fontSize: 11,
    color: "#64748B",

    textAlign: "center",
  },

  /* MY MOMENTS */

  momentsHeader: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "flex-end",

    marginHorizontal: 18,

    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E2B42",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D62962",
  },

  momentsRow: {
    flexDirection: "row",

    marginHorizontal: 18,
    marginTop: 13,

    justifyContent: "space-between",
  },

  momentImage: {
    width: (width - 50) / 3,
    height: 125,

    borderRadius: 15,
  },

  createMoment: {
    width: (width - 50) / 3,
    height: 125,

    borderRadius: 15,

    borderWidth: 1.5,
    borderStyle: "dashed",

    borderColor: "#F3C4D5",

    backgroundColor: "#FFF8FB",

    justifyContent: "center",
    alignItems: "center",
  },

  createMomentText: {
    textAlign: "center",

    color: "#C2255C",

    fontWeight: "800",

    fontSize: 13,

    marginTop: 3,
  },

  /* MENU */

  menuCard: {
    backgroundColor: "#FFFFFF",

    marginHorizontal: 18,
    marginTop: 23,

    borderRadius: 20,

    paddingVertical: 2,

    elevation: 3,
  },

  menuItem: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  menuIconBox: {
    width: 48,
    height: 48,

    borderRadius: 14,

    backgroundColor: "#F3F6FA",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  menuTextBox: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E2B42",
  },

  menuSubtitle: {
    fontSize: 12,
    color: "#64748B",

    marginTop: 2,
  },

  menuDivider: {
    height: 1,

    backgroundColor: "#EDF0F4",

    marginHorizontal: 15,
  },

  /* LOGOUT */

  logoutButton: {
    marginHorizontal: 18,
    marginTop: 20,

    height: 55,

    borderRadius: 17,

    backgroundColor: "#FFF3F6",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#D62962",

    fontSize: 18,
    fontWeight: "800",

    marginLeft: 8,
  },
});