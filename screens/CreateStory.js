import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp, doc, getDoc,} from "firebase/firestore";
export default function CreateStory({ navigation }) {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (imageUri) => {

    const data = new FormData();

    const file = new File(imageUri);

    data.append("file", file);

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

  const postStory = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    try {
      const imageUrl = await uploadToCloudinary(image);

      console.log("Saving story...");

console.log("Checking user document...");

const userDoc = await getDoc(
  doc(db, "users", auth.currentUser.uid)
);

console.log("User document read successfully.");

const userData = userDoc.data();

console.log("Creating story document...");

await addDoc(collection(db, "stories"), {
     imageUrl: imageUrl,
      uid: auth.currentUser.uid,
      name: userData.name,
      photoURL: userData.photoURL,
     createdAt: Timestamp.now(),
     })
      console.log("Story saved!");
      alert("Story uploaded!");
      if (navigation.canGoBack()) {
     navigation.goBack();
     } 
     else {
     navigation.navigate("Home");
    }
    } catch (error) {
        console.log(error);
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text>Select Story Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={postStory}>
        <Text style={styles.buttonText}>Upload Story</Text>
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
  },
  image: {
    width: 250,
    height: 400,
    borderRadius: 10,
  },
  placeholder: {
    width: 250,
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});