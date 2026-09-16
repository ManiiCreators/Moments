import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function RaiseYourVoice({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Raise Your Voice
        </Text>

        <View style={styles.headerSpace} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>

        <View style={styles.iconCircle}>
          <Text style={styles.icon}>📣</Text>
        </View>

        <Text style={styles.title}>
          See an issue in your area?
        </Text>

        <Text style={styles.subtitle}>
          Your voice can start a conversation
          {"\n"}
          and help create positive change.
        </Text>

        <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("RaiseQuestion")}
        >
          <Text style={styles.buttonText}>
            + Raise a Question
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },

  header: {
    height: 65,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f7f7f8",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 32,
    color: "#111111",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111111",
  },

  headerSpace: {
    width: 42,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 70,
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ef3b65",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 45,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
    marginTop: 25,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666666",
    textAlign: "center",
    marginTop: 12,
  },

  button: {
    marginTop: 30,
    backgroundColor: "#ef3b65",
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 28,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});