import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { db, auth } from "../firebase";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function EditImpact({ route, navigation }) {
  const { impactId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [action, setAction] = useState("");
  const [story, setStory] = useState("");
  const [location, setLocation] = useState("");
  const [peopleHelped, setPeopleHelped] = useState("");
  const [category, setCategory] = useState("Helping Others");

  const categories = [
    "Helping Others",
    "Environment",
    "Education",
    "Community",
    "Food & Donation",
    "Animals",
    "Other",
  ];

  // LOAD EXISTING IMPACT
  useEffect(() => {
    const loadImpact = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          Alert.alert("Error", "Please login again.");
          navigation.goBack();
          return;
        }

        const impactRef = doc(db, "impacts", impactId);
        const snapshot = await getDoc(impactRef);

        if (!snapshot.exists()) {
          Alert.alert("Error", "Impact not found.");
          navigation.goBack();
          return;
        }

        const data = snapshot.data();

        // SECURITY CHECK
        if (data.userId !== currentUser.uid) {
          Alert.alert(
            "Not Allowed",
            "You can only edit your own Impact."
          );
          navigation.goBack();
          return;
        }

        setAction(data.action || "");
        setStory(data.story || "");
        setLocation(data.location || "");
        setPeopleHelped(String(data.peopleHelped || "0"));
        setCategory(data.category || "Helping Others");
      } catch (error) {
        console.log("EDIT IMPACT LOAD ERROR:", error);

        Alert.alert(
          "Error",
          "Unable to load this Impact."
        );

        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadImpact();
  }, [impactId]);

  // SAVE CHANGES
  const handleUpdate = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "Please login again.");
      return;
    }

    if (!action.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter what impact you created."
      );
      return;
    }

    if (!story.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your Impact story."
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter the location."
      );
      return;
    }

    try {
      setSaving(true);

      const impactRef = doc(db, "impacts", impactId);

      // Check ownership again before updating
      const snapshot = await getDoc(impactRef);

      if (!snapshot.exists()) {
        Alert.alert("Error", "Impact not found.");
        return;
      }

      const existingData = snapshot.data();

      if (existingData.userId !== currentUser.uid) {
        Alert.alert(
          "Not Allowed",
          "You can only edit your own Impact."
        );
        return;
      }

      await updateDoc(impactRef, {
        action: action.trim(),
        story: story.trim(),
        location: location.trim(),
        peopleHelped: peopleHelped.trim() || "0",
        category: category,
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        "Impact Updated ❤️",
        "Your Impact has been updated successfully.",
        [
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log("EDIT IMPACT UPDATE ERROR:", error);

      Alert.alert(
        "Update Failed",
        "Unable to update your Impact. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#E83263"
        />

        <Text style={styles.loadingText}>
          Loading Impact...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Edit Impact
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >

        {/* ACTION */}
        <Text style={styles.label}>
          What did you do? ❤️
        </Text>

        <TextInput
          style={styles.input}
          value={action}
          onChangeText={setAction}
          placeholder="Example: I helped poor people"
          placeholderTextColor="#9AA3B2"
          multiline
        />

        {/* STORY */}
        <Text style={styles.label}>
          Tell your story
        </Text>

        <TextInput
          style={[styles.input, styles.storyInput]}
          value={story}
          onChangeText={setStory}
          placeholder="Share what happened..."
          placeholderTextColor="#9AA3B2"
          multiline
          textAlignVertical="top"
        />

        {/* LOCATION */}
        <Text style={styles.label}>
          Location 📍
        </Text>

        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Example: Kakinada"
          placeholderTextColor="#9AA3B2"
        />

        {/* PEOPLE HELPED */}
        <Text style={styles.label}>
          People Helped 👥
        </Text>

        <TextInput
          style={styles.input}
          value={peopleHelped}
          onChangeText={setPeopleHelped}
          placeholder="0"
          placeholderTextColor="#9AA3B2"
          keyboardType="numeric"
        />

        {/* CATEGORY */}
        <Text style={styles.label}>
          Category
        </Text>

        <View style={styles.categoryContainer}>
          {categories.map((item) => {
            const selected = category === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  selected && styles.categoryButtonSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.categoryTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SAVE */}
        <TouchableOpacity
          style={[
            styles.updateButton,
            saving && styles.updateButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={saving}
          onPress={handleUpdate}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.updateText}>
              ❤️ Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {/* CANCEL */}
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          disabled={saving}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },

  center: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#687386",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECF2",
  },

  backArrow: {
    fontSize: 36,
    lineHeight: 38,
    color: "#1F2A44",
    marginTop: -4,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1F2A44",
  },

  headerSpacer: {
    width: 44,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },

  label: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A44",
    marginTop: 18,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1F2A44",
    minHeight: 54,
  },

  storyInput: {
    minHeight: 120,
    paddingTop: 15,
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E7EF",
  },

  categoryButtonSelected: {
    backgroundColor: "#FCE8EE",
    borderColor: "#E83263",
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#687386",
  },

  categoryTextSelected: {
    color: "#E83263",
  },

  updateButton: {
    marginTop: 28,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#E83263",
    justifyContent: "center",
    alignItems: "center",
  },

  updateButtonDisabled: {
    opacity: 0.7,
  },

  updateText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  cancelButton: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#687386",
  },
});