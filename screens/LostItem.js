import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";

export default function LostItem() {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null);

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

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "foundItems"), {
        itemName,
        description,
        location,
        contact,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Found item reported successfully!");

      setItemName("");
      setDescription("");
      setLocation("");
      setContact("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Found Item</Text>

      <TextInput
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <TextInput
        placeholder="Lost Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />

      <TextInput
        placeholder="Contact Number"
        value={contact}
        onChangeText={setContact}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
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