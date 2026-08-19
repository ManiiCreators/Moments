import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

export default function RaiseQuestion({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Raise a Question</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* INTRO */}
        <View style={styles.intro}>
          <Text style={styles.introIcon}>📣</Text>

          <Text style={styles.title}>
            Bring attention to an issue
          </Text>

          <Text style={styles.subtitle}>
            Share what's happening and help start
            a positive conversation in your community.
          </Text>
        </View>

        {/* ISSUE TITLE */}
        <Text style={styles.label}>
          Question / Issue Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Why is our street not being cleaned?"
          placeholderTextColor="#999999"
        />

        {/* DESCRIPTION */}
        <Text style={styles.label}>
          Tell us more
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Explain what is happening..."
          placeholderTextColor="#999999"
          multiline
          textAlignVertical="top"
        />

        {/* LOCATION */}
        <Text style={styles.label}>
          Where is this happening?
        </Text>

        <TouchableOpacity style={styles.locationBox}>
          <Text style={styles.locationIcon}>📍</Text>

          <Text style={styles.locationText}>
            Add location
          </Text>
        </TouchableOpacity>

        {/* CATEGORY */}
        <Text style={styles.label}>
          Category
        </Text>

        <View style={styles.categoryRow}>
          <Category text="Cleanliness" />
          <Category text="Roads" />
          <Category text="Water" />
        </View>

        <View style={styles.categoryRow}>
          <Category text="Safety" />
          <Category text="Environment" />
          <Category text="Other" />
        </View>

        {/* PHOTO */}
        <Text style={styles.label}>
          Add a photo <Text style={styles.optional}>(optional)</Text>
        </Text>

        <TouchableOpacity style={styles.photoBox}>
          <Text style={styles.photoIcon}>＋</Text>
          <Text style={styles.photoText}>
            Add photo
          </Text>
        </TouchableOpacity>

        {/* POST BUTTON */}
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>
            Post Question
          </Text>

          <Text style={styles.postArrow}>
            ›
          </Text>
        </TouchableOpacity>

        <Text style={styles.bottomMessage}>
          Let's raise awareness, not conflict. ❤️
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}


/* ================= CATEGORY ================= */

function Category({ text }) {
  return (
    <TouchableOpacity style={styles.category}>
      <Text style={styles.categoryText}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}


/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },

  header: {
    height: 72,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f7f7f8",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 34,
    color: "#111111",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111111",
  },

  headerSpace: {
    width: 44,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 35,
  },

  intro: {
    alignItems: "center",
    marginBottom: 25,
  },

  introIcon: {
    fontSize: 45,
    marginBottom: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 330,
  },

  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 9,
    marginTop: 18,
  },

  optional: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999999",
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: "#222222",
  },

  textArea: {
    height: 125,
    paddingTop: 14,
  },

  locationBox: {
    height: 55,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  locationIcon: {
    fontSize: 21,
    marginRight: 10,
  },

  locationText: {
    fontSize: 14,
    color: "#777777",
  },

  categoryRow: {
    flexDirection: "row",
    marginBottom: 9,
  },

  category: {
    backgroundColor: "#fff0f4",
    borderWidth: 1,
    borderColor: "#f7d9e1",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 8,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d9365f",
  },

  photoBox: {
    height: 95,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  photoIcon: {
    fontSize: 25,
    color: "#ef3b65",
  },

  photoText: {
    fontSize: 12,
    color: "#777777",
    marginTop: 3,
  },

  postButton: {
    height: 56,
    backgroundColor: "#ef3b65",
    borderRadius: 28,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  postButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },

  postArrow: {
    color: "#ffffff",
    fontSize: 28,
    marginLeft: 10,
    marginTop: -2,
  },

  bottomMessage: {
    textAlign: "center",
    fontSize: 12,
    color: "#888888",
    marginTop: 14,
  },

});