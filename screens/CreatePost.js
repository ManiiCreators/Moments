import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image} from "react-native";
import { db } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import * as ImagePicker from "expo-image-picker";

export default function CreatePost() {
const [loading, setLoading] = useState(false);
const [caption, setCaption] = useState("");
const [imageUrl, setImageUrl] = useState("");
const pickImage = async () => {
const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Please allow gallery access.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    setImageUrl(result.assets[0].uri);
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
const handleSubmit = async () => {
  if (loading) return;

  setLoading(true);

  try {
  const user = auth.currentUser;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();
  const uploadedImage = imageUrl
  ? await uploadToCloudinary(imageUrl)
  : "";

  await addDoc(collection(db, "posts"), {
    userId: user.uid,
    userName: userData.name,
    userPhoto: userData.photoURL,
    caption,
    imageUrl: uploadedImage,
    createdAt: new Date(),
    likes: 0,
    likedBy: [],
    comments: 0,
  });

  setLoading(false);
  Alert.alert("Success", "Post created successfully!");
  setCaption("");
  setImageUrl("");
 } catch (error) {
  setLoading(false);
  Alert.alert("Error", error.message);
 }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post</Text>

<TextInput
  placeholder="What's on your mind?"
  value={caption}
  onChangeText={setCaption}
  style={styles.input}
/>
<TouchableOpacity
  style={styles.button}
  onPress={pickImage}
>
  <Text style={styles.buttonText}>Choose Photo</Text>
</TouchableOpacity>

{imageUrl ? (
  <>
    <Text>✅ Photo Selected</Text>

    <Image
      source={{ uri: imageUrl }}
      style={{
        width: 250,
        height: 250,
        marginTop: 10,
        borderRadius: 10,
      }}
    />
  </>
) : null}

  <TouchableOpacity onPress={handleSubmit} disabled={loading || (!caption && !imageUrl)}
  style={[ styles.button, loading && { opacity: 0.6 }]}>
  <Text style={styles.buttonText}>
    {loading ? "Uploading..." : "Submit"}
  </Text>
 </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});