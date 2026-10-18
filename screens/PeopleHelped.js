import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { db, auth } from "../firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default function PeopleHelped({ navigation }) {
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setImpacts([]);
      setLoading(false);
      return;
    }

    const impactsQuery = query(
      collection(db, "impacts"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      impactsQuery,
      (snapshot) => {
        const impactList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        impactList.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        });

        setImpacts(impactList);
        setLoading(false);
      },
      (error) => {
        console.log("PEOPLE HELPED ERROR:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Calculate total people helped
  const totalPeopleHelped = impacts.reduce((total, item) => {
    return total + (parseInt(item.peopleHelped, 10) || 0);
  }, 0);

  const renderImpact = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("ImpactDetails", {
            impactId: item.id,
          })
        }
      >
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <View style={styles.heartCircle}>
            <Text style={styles.heart}>❤️</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.category}>
              {item.category || "Impact"}
            </Text>

            <Text style={styles.location}>
              📍 {item.location || "Location not added"}
            </Text>
          </View>
        </View>

        {/* ACTION */}
        <Text style={styles.action}>
          {item.action || "Impact action"}
        </Text>

        {/* STORY */}
        {item.story ? (
          <Text style={styles.story}>
            {item.story}
          </Text>
        ) : null}

        {/* PEOPLE HELPED */}
        <View style={styles.bottomRow}>
          <View style={styles.peopleBox}>
            <Text style={styles.peopleIcon}>👥</Text>

            <View>
              <Text style={styles.peopleNumber}>
                {item.peopleHelped || "0"}
              </Text>

              <Text style={styles.peopleLabel}>
                People Helped
              </Text>
            </View>
          </View>

          <View style={styles.likesBox}>
            <Text style={styles.likeIcon}>❤️</Text>

            <Text style={styles.likeText}>
              {item.likes || 0}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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
          Loading People Helped...
        </Text>
      </View>
    );
  }

  // EMPTY
  if (impacts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          People Helped 👥
        </Text>

        <Text style={styles.subtitle}>
          Your helping actions will appear here.
        </Text>

        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>
            👥
          </Text>

          <Text style={styles.emptyTitle}>
            No People Helped yet
          </Text>

          <Text style={styles.emptyText}>
            When you create an Impact and add people
            helped, it will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* TITLE */}
      <Text style={styles.title}>
        People Helped 👥
      </Text>

      {/* TOTAL */}
      <View style={styles.totalCard}>
        <View style={styles.totalIconCircle}>
          <Text style={styles.totalIcon}>👥</Text>
        </View>

        <View>
          <Text style={styles.totalNumber}>
            {totalPeopleHelped}
          </Text>

          <Text style={styles.totalLabel}>
            People Helped
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Your Helping Actions
      </Text>

      <FlatList
        data={impacts}
        keyExtractor={(item) => item.id}
        renderItem={renderImpact}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingTop: 55,
    paddingHorizontal: 18,
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

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 18,
  },

  subtitle: {
    fontSize: 16,
    color: "#687386",
    marginBottom: 20,
  },

  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECF2",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    marginBottom: 22,
  },

  totalIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#E8F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  totalIcon: {
    fontSize: 30,
  },

  totalNumber: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2A44",
  },

  totalLabel: {
    fontSize: 14,
    color: "#687386",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 14,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E9ECF2",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  heartCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FCE8EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  heart: {
    fontSize: 23,
  },

  category: {
    fontSize: 15,
    fontWeight: "800",
    color: "#E83263",
  },

  location: {
    fontSize: 13,
    color: "#687386",
    marginTop: 4,
  },

  action: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 7,
  },

  story: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5F6978",
    marginBottom: 14,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
    paddingTop: 13,
  },

  peopleBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  peopleIcon: {
    fontSize: 23,
    marginRight: 8,
  },

  peopleNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A44",
  },

  peopleLabel: {
    fontSize: 11,
    color: "#687386",
    marginTop: 1,
  },

  likesBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  likeIcon: {
    fontSize: 19,
    marginRight: 5,
  },

  likeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#687386",
  },

  emptyBox: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 25,
  },

  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#687386",
  },
});