import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function EditProfile({ navigation }) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

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

        setName(data.name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Unable to load profile details."
      );
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Name Required",
        "Please enter your name."
      );
      return;
    }

    setLoading(true);

    try {
      await setDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid
        ),
        {
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim(),
          location: location.trim(),
        },
        { merge: true }
      );

      Alert.alert(
        "Success 🎉",
        "Profile updated successfully!",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.goBack(),
          },
        ]
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

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#1E2B42"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Edit Profile
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* NAME */}

        <Text style={styles.label}>
          Name
        </Text>

        <View style={styles.inputBox}>
          <Ionicons
            name="person-outline"
            size={21}
            color="#64748B"
          />

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* USERNAME */}

        <Text style={styles.label}>
          Username
        </Text>

        <View style={styles.inputBox}>
          <Ionicons
            name="at-outline"
            size={21}
            color="#64748B"
          />

          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="@username"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        {/* BIO */}

        <Text style={styles.label}>
          Bio
        </Text>

        <View style={styles.bioBox}>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={150}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.characterCount}>
          {bio.length}/150
        </Text>

        {/* LOCATION */}

        <Text style={styles.label}>
          Location
        </Text>

        <View style={styles.inputBox}>
          <Ionicons
            name="location-outline"
            size={21}
            color="#64748B"
          />

          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Your location"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* SAVE BUTTON */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.disabledButton,
          ]}
          onPress={saveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={styles.saveText}
              >
                Save Changes
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F5FA",
  },

  /* HEADER */

  header: {
    height: 65,
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 18,

    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF3",
  },

  backButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "#F3F5FA",

    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E2B42",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  /* FORM */

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#27364F",

    marginBottom: 8,
    marginTop: 8,
  },

  inputBox: {
    height: 56,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  input: {
    flex: 1,

    fontSize: 16,
    color: "#1E2B42",

    marginLeft: 10,
  },

  /* BIO */

  bioBox: {
    height: 125,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    padding: 14,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  bioInput: {
    flex: 1,

    fontSize: 16,
    color: "#1E2B42",
  },

  characterCount: {
    fontSize: 12,
    color: "#94A3B8",

    textAlign: "right",

    marginTop: 5,
  },

  /* SAVE */

  saveButton: {
    height: 56,

    backgroundColor: "#D62962",

    borderRadius: 16,

    marginTop: 35,

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    elevation: 4,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveText: {
    color: "#FFFFFF",

    fontSize: 17,
    fontWeight: "800",

    marginLeft: 8,
  },
});