
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function JoinedInitiatives({ navigation }) {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJoinedInitiatives = async () => {
    const user = auth.currentUser;

    if (!user) {
      setInitiatives([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Find initiatives where this user is a participant.
      const initiativesSnapshot = await getDocs(
        collection(db, "initiatives")
      );

      const joined = [];

      for (const initiativeDoc of initiativesSnapshot.docs) {
        const participantRef = collection(
          db,
          "initiatives",
          initiativeDoc.id,
          "participants"
        );

        const participantQuery = query(
          participantRef,
          where("userId", "==", user.uid)
        );

        const participantSnapshot = await getDocs(participantQuery);

        if (!participantSnapshot.empty) {
          joined.push({
            id: initiativeDoc.id,
            ...initiativeDoc.data(),
          });
        }
      }

      joined.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });

      setInitiatives(joined);
    } catch (error) {
      console.log("LOAD JOINED INITIATIVES ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJoinedInitiatives();
  }, []);

  const renderInitiative = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("InitiativeDetails", {
          initiative: item,
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="people-outline"
            size={24}
            color="#B76E79"
          />
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.category}>
            {item.category || "COMMUNITY"}
          </Text>
          <Text style={styles.title}>
            {item.title || "Untitled initiative"}
          </Text>
          <Text style={styles.location}>
            <Ionicons
              name="location-outline"
              size={14}
              color="#B76E79"
            />{" "}
            {item.location || "Location not specified"}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {item.description || "Be part of a positive community impact."}
      </Text>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>
          <Ionicons name="people-outline" size={16} color="#B76E79" />{" "}
          {Number(item.joinedCount || 0)} joined
        </Text>

        <Text style={styles.stat}>
          <Ionicons name="heart-outline" size={16} color="#B76E79" />{" "}
          {Number(item.peopleHelped || 0)} helped
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {item.ongoing === false ||
          item.status?.toLowerCase() === "completed"
          ? "Completed"
          : "Ongoing"}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#B76E79"
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#B76E79" />
        <Text style={styles.loadingText}>
          Loading your initiatives...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={23} color="#26352D" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Joined Initiatives</Text>
      </View>

      <FlatList
        data={initiatives}
        keyExtractor={(item) => item.id}
        renderItem={renderInitiative}
        contentContainerStyle={[
          styles.listContent,
          initiatives.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadJoinedInitiatives();
            }}
            tintColor="#B76E79"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-circle-outline"
              size={64}
              color="#B76E79"
            />
            <Text style={styles.emptyTitle}>
              Your impact journey starts here
            </Text>
            <Text style={styles.emptyDescription}>
              Initiatives you join will appear here.
            </Text>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate("Community")}
            >
              <Text style={styles.exploreButtonText}>
                Explore Community
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFD F8".replace(" ", ""),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#FFFD F8".replace(" ", ""),
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#F5F0E7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#26352D",
    marginRight: 42,
  },
  listContent: {
    padding: 18,
    paddingBottom: 30,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEE7DB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#F8F0EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleArea: {
    flex: 1,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#B76E79",
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#26352D",
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: "#77756F",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#686963",
    marginTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 18,
  },
  stat: {
    fontSize: 13,
    color: "#686963",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEE7DB",
    paddingTop: 14,
    marginTop: 16,
  },
  footerText: {
    color: "#50765E",
    fontSize: 14,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFD F8".replace(" ", ""),
  },
  loadingText: {
    marginTop: 12,
    color: "#686963",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 18,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#26352D",
    textAlign: "center",
    marginTop: 18,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#77756F",
    textAlign: "center",
    marginTop: 8,
  },
  exploreButton: {
    backgroundColor: "#50765E",
    borderRadius: 15,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 22,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
