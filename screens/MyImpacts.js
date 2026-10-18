import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, } from "react-native";

import { db, auth } from "../firebase";

import { collection, onSnapshot, query, where,} from "firebase/firestore";

export default function MyImpacts({ navigation }) {
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatImpactDate = (timestamp) => {
  if (!timestamp?.toDate) {
    return "";
  }

  const date = timestamp.toDate();
  const now = new Date();

  const difference = Math.floor(
    (now - date) / (1000 * 60 * 60 * 24)
  );

  if (difference === 0) {
    return "Today";
  }

  if (difference === 1) {
    return "1d ago";
  }

  if (difference < 7) {
    return `${difference}d ago`;
  }

  return date.toLocaleDateString();
};

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

        // Newest impacts first
        impactList.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        });

        setImpacts(impactList);
        setLoading(false);
      },
      (error) => {
        console.log("MY IMPACTS ERROR:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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

            <Text style={styles.createdTime}>
            {formatImpactDate(item.createdAt)}
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

        {/* PHOTO */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.impactImage}
          />
        ) : null}

        {/* PEOPLE HELPED */}
        <View style={styles.bottomRow}>

  <View style={styles.peopleStat}>
    <Text style={styles.statIcon}>👥</Text>

    <Text style={styles.statText}>
      {item.peopleHelped || "0"} People Helped
    </Text>
  </View>

  <View style={styles.rightStats}>

    <View style={styles.smallStat}>
      <Text style={styles.statIcon}>❤️</Text>

      <Text style={styles.statText}>
        {item.likes || 0}
      </Text>
    </View>

    <View style={styles.smallStat}>
      <Text style={styles.statIcon}>💬</Text>

      <Text style={styles.statText}>
        {item.comments || 0}
      </Text>
    </View>

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
          Loading your Impacts...
        </Text>
      </View>
    );
  }

  // EMPTY STATE
  if (impacts.length === 0) {
    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          My Impacts ❤️
        </Text>

        <Text style={styles.subtitle}>
          Your impact actions will appear here.
        </Text>

        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>
            ❤️
          </Text>

          <Text style={styles.emptyTitle}>
            No Impacts yet
          </Text>

          <Text style={styles.emptyText}>
            When you create an Impact, it will appear here.
          </Text>
        </View>

      </View>
    );
  }

  // IMPACT LIST
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        My Impacts ❤️
      </Text>

      <Text style={styles.subtitle}>
        {impacts.length} Impact
        {impacts.length === 1 ? "" : "s"}
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
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 16,
    color: "#687386",
    marginBottom: 20,
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
    fontSize: 14,
    fontWeight: "800",
    color: "#E83263",
  },

  location: {
    fontSize: 12,
    color: "#687386",
    marginTop: 4,
  },

  createdTime: {
  fontSize: 11,
  color: "#9299A6",
  marginTop: 3,
},

  action: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 8,
  },

  story: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5F6978",
    marginBottom: 14,
  },

  impactImage: {
    width: "100%",
    height: 190,
    borderRadius: 15,
    marginBottom: 14,
  },

 bottomRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderTopWidth: 1,
  borderTopColor: "#EEF0F4",
  paddingTop: 12,
},

peopleStat: {
  flexDirection: "row",
  alignItems: "center",
},

rightStats: {
  flexDirection: "row",
  alignItems: "center",
},

smallStat: {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 18,
},

statIcon: {
  fontSize: 14,
  marginRight: 4,
},

statText: {
  fontSize: 11,
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