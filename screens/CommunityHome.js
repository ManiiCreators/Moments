import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityHome() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>
            Connect, help, and grow together. ❤️
          </Text>
        </View>

        {/* Around You */}
        <View style={styles.card}>
          <Text style={styles.icon}>📍</Text>

          <Text style={styles.cardTitle}>Around You</Text>

          <Text style={styles.cardText}>
            Discover people, activities, and opportunities around you.
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Explore →</Text>
          </TouchableOpacity>
        </View>

        {/* Help & Support */}
        <View style={styles.card}>
          <Text style={styles.icon}>🤝</Text>

          <Text style={styles.cardTitle}>Help & Support</Text>

          <Text style={styles.cardText}>
            Find people who need help or offer your support to others.
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Explore →</Text>
          </TouchableOpacity>
        </View>

        {/* Local Activities */}
        <View style={styles.card}>
          <Text style={styles.icon}>🌱</Text>

          <Text style={styles.cardTitle}>Local Activities</Text>

          <Text style={styles.cardText}>
            Discover volunteering, community events, and activities near you.
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Explore →</Text>
          </TouchableOpacity>
        </View>

        {/* Community Stories */}
     <View style={styles.card}>
    <Text style={styles.icon}>❤️</Text>

    <Text style={styles.cardTitle}>Community Stories</Text>

    <Text style={styles.cardText}>
    See how people around you are making a difference.
    </Text>

    <TouchableOpacity style={styles.button}>
    <Text style={styles.buttonText}>Explore →</Text>
    </TouchableOpacity>
   </View>

      </ScrollView>
    </SafeAreaView>
  );
}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 25,
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    color: "#666",
    lineHeight: 26,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },

  icon: {
    fontSize: 38,
    marginBottom: 18,
  },

  cardTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },

  cardText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignSelf: "flex-start",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});