import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Signup({ navigation }) {

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const handleSignup = async () => {
  if (!name || !email || !password) {
  alert("Please fill all fields");
  return;
 }
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

await setDoc(doc(db, "users", userCredential.user.uid), {
  uid: userCredential.user.uid,
  name: name,
  email: email,
  photoURL: "",
  bio: "",
  followers: [],
  following: [],
  isOnline: true,
  createdAt: new Date(),
});

   alert("Account created successfully!");
   } 
    catch (error) {
    alert(error.message);
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

  <TextInput
  style={styles.input}
  placeholder="Full Name"
  value={name}
  onChangeText={setName}
   />

  <TextInput
  style={styles.input}
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  />

  <TextInput
  style={styles.input}
  placeholder="Password"
  secureTextEntry
  value={password}
  onChangeText={setPassword}
  />

<TouchableOpacity
  style={styles.button}
  onPress={handleSignup}
>       
 <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#E1306C",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#E1306C",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});