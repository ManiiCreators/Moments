import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { getDoc } from "firebase/firestore";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image,} from "react-native";

export default function Profile({ navigation }) {

const [loading, setLoading] = useState(false);
const [image, setImage] = useState(null);
const [name, setName] = useState("Manikanta");
const [userData, setUserData] = useState(null);
const [bio, setBio] = useState("Moments Creator 🚀");
useEffect(() => {
  loadProfile();
}, []);

const loadProfile = async () => {
  try {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
  const data = docSnap.data();

  setUserData(data);
  setName(data.name || "");
  setBio(data.bio || "");
  setImage(data.photoURL || null);
}
  } catch (error) {
    console.log(error);
  }
};
const uploadToCloudinary = async (imageUri) => {
  const data = new FormData();

  data.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "photo.jpg",
  });

  data.append("upload_preset", "moments_upload");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/kn56xivr/image/upload",
    {
      method: "POST",
      body: data,
    }
  );

const result = await response.json();
return result.secure_url;
};
const saveProfile = async () => {
  if (loading) return;

setLoading(true);
  try {
  const uploadedPhoto = image
  ? await uploadToCloudinary(image)
  : "";

await setDoc(
  doc(db, "users", auth.currentUser.uid),
  {
    name,
    bio,
    photoURL: uploadedPhoto,
  },
  { merge: true }
);
    setLoading(false);
    alert("Profile saved successfully!");
    setImage(uploadedPhoto);
  } catch (error) {
    setLoading(false);
    alert(error.message);
  }
};
  const logout = async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
    } catch (error) {
    alert(error.message);
  }
 };
const pickImage = async () => {
const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};

  return (
    <View style={styles.container}>
   <TouchableOpacity onPress={pickImage}>
  <Image
    source={
      image
        ? { uri: image }
        : require("../assets/icon.png")
    }
    style={styles.profileImage}
  />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your Name"
      />

      <TextInput
        style={styles.input}
        value={bio}
        onChangeText={setBio}
        placeholder="Your Bio"
      />

     <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={loading}>       
     <Text style={styles.buttonText}>
     {loading ? "Saving..." : "Save Profile"}
     </Text>
     </TouchableOpacity>

     <TouchableOpacity
  onPress={() => {
    console.log("Navigation:", navigation);
    navigation.push("RepliesTest");
  }}
  style={{
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  }}
>
  <Text
    style={{
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    Story Replies
  </Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => navigation.navigate("SavedMoments")}
  style={{
    backgroundColor: "#FFB300",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
  }}
>
  <Text
    style={{
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
    }}
  >
    🔖 Saved Moments
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={{
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  }}
  onPress={logout}
>
  <Text
    style={{
      color: "white",
      fontWeight: "bold",
      fontSize: 18,
    }}
  >
    Logout
  </Text>
</TouchableOpacity>

</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1877F2",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});