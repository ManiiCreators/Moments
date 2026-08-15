import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function CreateImpact({ navigation }) {
  const [help, setHelp] = useState("");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Create Impact
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={styles.emoji}>🌱</Text>

          <Text style={styles.title}>
            Share a good action
          </Text>

          <Text style={styles.subtitle}>
            Every act of kindness matters.
            Your story may inspire someone else. ❤️
          </Text>
        </View>

        {/* What did you do? */}
        <View style={styles.card}>

          <Text style={styles.question}>
            What did you do today?
          </Text>

          <Text style={styles.label}>
            Tell us about the help you gave
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: I helped an elderly person carry groceries."
            placeholderTextColor="#999999"
            value={help}
            onChangeText={setHelp}
            multiline
          />

        </View>

        {/* Details */}
        <View style={styles.card}>

          <Text style={styles.question}>
            Tell your story
          </Text>

          <Text style={styles.label}>
            What happened?
          </Text>

          <TextInput
            style={[styles.input, styles.largeInput]}
            placeholder="Share a little more about this moment..."
            placeholderTextColor="#999999"
            value={details}
            onChangeText={setDetails}
            multiline
            textAlignVertical="top"
          />

        </View>

        {/* Location */}
        <View style={styles.card}>

          <Text style={styles.question}>
            Where did it happen? 📍
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Kakinada"
            placeholderTextColor="#999999"
            value={location}
            onChangeText={setLocation}
          />

        </View>

        {/* Date */}
        <View style={styles.card}>

          <Text style={styles.question}>
            When did it happen? 📅
          </Text>

          <TouchableOpacity style={styles.dateButton}>
            <Text style={styles.dateText}>
              Today
            </Text>
          </TouchableOpacity>

        </View>

        {/* Photo */}
        <View style={styles.card}>

          <Text style={styles.question}>
            Add a photo 📸
          </Text>

          <Text style={styles.label}>
            Optional — a photo can help tell your story.
          </Text>

          <TouchableOpacity style={styles.photoButton}>
            <Text style={styles.photoButtonText}>
              ＋ Add Photo
            </Text>
          </TouchableOpacity>

        </View>

        {/* Share */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {}}
        >
          <Text style={styles.shareButtonText}>
            ❤️ Share Impact
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your kindness could inspire another person today. 🌱
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#111111",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111111",
  },

  intro: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 20,
  },

  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111111",
  },

  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111111",
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 10,
    lineHeight: 20,
  },

  input: {
    minHeight: 55,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111111",
    backgroundColor: "#fafafa",
  },

  largeInput: {
    minHeight: 120,
  },

  dateButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },

  photoButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dddddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },

  photoButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111111",
  },

  shareButton: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: "#111111",
    borderRadius: 28,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  shareButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  footerText: {
    textAlign: "center",
    color: "#888888",
    fontSize: 14,
    marginTop: 15,
    paddingHorizontal: 30,
  },
});