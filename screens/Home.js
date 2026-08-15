import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function Home({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false}>


      <View style={styles.header}>
        <Text style={styles.title}>Moments</Text>
      </View>

      <View style={styles.content}>

        {/* Impact Hero */}
        <View style={styles.impactHero}>

          <Text style={styles.impactEmoji}>🌱</Text>

          <Text style={styles.impactTitle}>
            What impact will you create today?
          </Text>

          <Text style={styles.impactSubtitle}>
            Every good action matters. ❤️
          </Text>

          <TouchableOpacity
            style={styles.impactButton}
            onPress={() => navigation.navigate("CreateImpact")}
          >
            <Text style={styles.impactButtonText}>
              ＋ Create Impact
            </Text>
          </TouchableOpacity>

        </View>

        {/* Moments */}
        <View style={styles.featureCard}>

          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>📸</Text>
          </View>

          <View style={styles.featureText}>

            <Text style={styles.featureTitle}>
              Moments
            </Text>

            <Text style={styles.featureSubtitle}>
              Share your life, discover new moments,
              and connect with people around you.
            </Text>

          </View>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate("Moments")}
          >
            <Text style={styles.featureButtonText}>
              Explore →
            </Text>
          </TouchableOpacity>

        </View>
        {/* Community */}
        <View style={styles.featureCard}>

          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>👥</Text>
          </View>

          <View style={styles.featureText}>

            <Text style={styles.featureTitle}>
              Community
            </Text>

            <Text style={styles.featureSubtitle}>
              Connect with people, discover local activities,
              and grow together.
            </Text>

          </View>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate("Community")}
          >
            <Text style={styles.featureButtonText}>
              Explore →
            </Text>
          </TouchableOpacity>

        </View>

        {/* Around You */}
        <View style={styles.featureCard}>

          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>📍</Text>
          </View>

          <View style={styles.featureText}>

            <Text style={styles.featureTitle}>
              Around You
            </Text>

            <Text style={styles.featureSubtitle}>
              Discover people, activities, and opportunities
              happening around you.
            </Text>

          </View>

          <TouchableOpacity
            style={styles.featureButton}
          >
            <Text style={styles.featureButtonText}>
              Explore →
            </Text>
          </TouchableOpacity>
        </View>
        {/* Impact Stories */}
        <View style={styles.featureCard}>

          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>❤️</Text>
          </View>

          <View style={styles.featureText}>

            <Text style={styles.featureTitle}>
              Impact Stories
            </Text>

            <Text style={styles.featureSubtitle}>
              See the good happening around you and get inspired
              to make a difference.
            </Text>

          </View>

          <TouchableOpacity
            style={styles.featureButton}
          >
            <Text style={styles.featureButtonText}>
              Explore →
            </Text>
          </TouchableOpacity>

        </View>
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

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  impactHero: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  impactEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },

  impactTitle: {
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 34,
  },

  impactSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 12,
    textAlign: "center",
  },

  impactButton: {
    marginTop: 22,
    backgroundColor: "#111111",
    paddingVertical: 13,
    paddingHorizontal: 25,
    borderRadius: 25,
  },

  impactButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  featureCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  featureEmoji: {
    fontSize: 26,
  },

  featureText: {
    marginBottom: 16,
  },

  featureTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  featureSubtitle: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
    marginTop: 6,
  },

  featureButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111111",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  featureButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});