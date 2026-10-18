import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
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

export default function MyInitiatives({ navigation }) {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // LOAD MY INITIATIVES
  // =====================================================

  const loadMyInitiatives = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setInitiatives([]);
        return;
      }

      const q = query(
        collection(db, "initiatives"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Newest first
      data.sort((a, b) => {
        const aTime = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : 0;

        const bTime = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : 0;

        return bTime - aTime;
      });

      setInitiatives(data);
    } catch (error) {
      console.log("LOAD INITIATIVES ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyInitiatives();
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadMyInitiatives();
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    if (typeof date === "string") {
      return date;
    }

    if (date?.toDate) {
      return date.toDate().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return "";
  };

  // =====================================================
  // RENDER INITIATIVE
  // =====================================================

  const renderInitiative = ({ item }) => {
    const target = Number(item.peopleTarget) || 0;
    const helped = Number(item.peopleHelped) || 0;

    const progress =
      target > 0
        ? Math.min(helped / target, 1)
        : 0;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => {
          // Initiative Details will be connected later
          console.log("INITIATIVE:", item.id);
        }}
      >

        {/* ================================================= */}
        {/* COVER */}
        {/* ================================================= */}

        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.coverImage}
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <View style={styles.placeholderIcon}>
              <Ionicons
                name="leaf"
                size={34}
                color="#58765F"
              />
            </View>

            <Text style={styles.placeholderText}>
              Your Initiative
            </Text>
          </View>
        )}

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <View style={styles.content}>

          {/* CATEGORY */}

          {item.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {item.category}
              </Text>
            </View>
          ) : null}

          {/* TITLE */}

          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {item.title || "Untitled Initiative"}
          </Text>

          {/* DESCRIPTION */}

          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {item.description || "Making a meaningful difference together."}
          </Text>

          {/* LOCATION */}

          {item.location ? (
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color="#6F7A70"
              />

              <Text style={styles.infoText}>
                {item.location}
              </Text>
            </View>
          ) : null}

          {/* PEOPLE */}

          <View style={styles.statsRow}>

            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={19}
                color="#58765F"
              />

              <Text style={styles.statText}>
                {item.joinedCount || 0} joined
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons
                name="heart-outline"
                size={19}
                color="#E83263"
              />

              <Text style={styles.statText}>
                {item.peopleHelped || 0} helped
              </Text>
            </View>

          </View>

          {/* PROGRESS */}

          <View style={styles.progressSection}>

            <View style={styles.progressHeader}>

              <Text style={styles.progressLabel}>
                People helped
              </Text>

              <Text style={styles.progressNumber}>
                {item.peopleHelped || 0}/{item.peopleTarget || 0}
              </Text>

            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>

          </View>

          {/* STATUS */}

          <View style={styles.bottomRow}>

            <View style={styles.statusRow}>

              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {item.ongoing ? "Ongoing" : "Completed"}
              </Text>

            </View>

            {item.startDate ? (
              <Text style={styles.dateText}>
                Started {formatDate(item.startDate)}
              </Text>
            ) : null}

          </View>

        </View>
      </TouchableOpacity>
    );
  };

  // =====================================================
  // EMPTY STATE
  // =====================================================

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>

        <View style={styles.emptyIcon}>
          <Ionicons
            name="leaf-outline"
            size={42}
            color="#58765F"
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Initiatives yet
        </Text>

        <Text style={styles.emptyText}>
          Start something meaningful and invite
          others to make a difference together.
        </Text>

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("CreateInitiative")
          }
        >
          <Ionicons
            name="leaf"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.createButtonText}>
            Start an Initiative
          </Text>
        </TouchableOpacity>

      </View>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#58765F"
        />

        <Text style={styles.loadingText}>
          Loading your initiatives...
        </Text>
      </View>
    );
  }

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color="#29251F"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            My Initiatives
          </Text>

          <Text style={styles.headerSubtitle}>
            Ideas that create change. 🌱
          </Text>
        </View>

      </View>

      {/* LIST */}

      <FlatList
        data={initiatives}
        keyExtractor={(item) => item.id}
        renderItem={renderInitiative}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          initiatives.length === 0
            ? styles.emptyList
            : styles.list
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#58765F"
          />
        }
      />

    </View>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F7F3",
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E9E9E4",
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0F2EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: "#29251F",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#7B8179",
    marginTop: 3,
  },

  // =====================================================
  // LIST
  // =====================================================

  list: {
    padding: 16,
    paddingBottom: 35,
  },

  // =====================================================
  // CARD
  // =====================================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6E5DE",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  coverImage: {
    width: "100%",
    height: 190,
  },

  coverPlaceholder: {
    height: 190,
    backgroundColor: "#EDF4ED",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#DDEBDE",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#69806D",
  },

  // =====================================================
  // CONTENT
  // =====================================================

  content: {
    padding: 18,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF3EA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#55715B",
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    color: "#29251F",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#77766F",
    marginTop: 7,
  },

  // =====================================================
  // INFO
  // =====================================================

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  infoText: {
    fontSize: 13,
    color: "#6F756E",
    marginLeft: 7,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    gap: 22,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  statText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555B55",
    marginLeft: 6,
  },

  // =====================================================
  // PROGRESS
  // =====================================================

  progressSection: {
    marginTop: 17,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#73786F",
  },

  progressNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#55715B",
  },

  progressBackground: {
    height: 7,
    borderRadius: 10,
    backgroundColor: "#E7EAE4",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#63856B",
  },

  // =====================================================
  // BOTTOM
  // =====================================================

  bottomRow: {
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5E8A67",
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5E8064",
  },

  dateText: {
    fontSize: 11,
    color: "#8A8B84",
  },

  // =====================================================
  // EMPTY
  // =====================================================

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 30,
  },

  emptyContainer: {
    alignItems: "center",
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E7F0E7",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#29251F",
    marginTop: 18,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#777A74",
    marginTop: 8,
    maxWidth: 310,
  },

  createButton: {
    marginTop: 22,
    backgroundColor: "#294B35",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F7F3",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#777A74",
  },

});