import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default function ImpactDashboard({ navigation }) {
  const [loading, setLoading] = useState(true);

  const [impactCount, setImpactCount] = useState(0);
  const [peopleHelped, setPeopleHelped] = useState(0);

  const [initiativeCount, setInitiativeCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [initiativePeopleHelped, setInitiativePeopleHelped] =
    useState(0);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    let impactsLoaded = false;
    let initiativesLoaded = false;

    const impactsQuery = query(
      collection(db, "impacts"),
      where("userId", "==", user.uid)
    );

    const unsubscribeImpacts = onSnapshot(
      impactsQuery,
      (snapshot) => {
        let helped = 0;

        snapshot.forEach((impactDoc) => {
          const data = impactDoc.data();
          helped += Number(data.peopleHelped) || 0;
        });

        setImpactCount(snapshot.size);
        setPeopleHelped(helped);

        impactsLoaded = true;

        if (initiativesLoaded) {
          setLoading(false);
        }
      },
      (error) => {
        console.log("DASHBOARD IMPACTS ERROR:", error);
        impactsLoaded = true;

        if (initiativesLoaded) {
          setLoading(false);
        }
      }
    );

    const initiativesQuery = query(
      collection(db, "initiatives"),
      where("userId", "==", user.uid)
    );

    const unsubscribeInitiatives = onSnapshot(
      initiativesQuery,
      (snapshot) => {
        let completed = 0;
        let initiativeHelped = 0;

        snapshot.forEach((initiativeDoc) => {
          const data = initiativeDoc.data();

          if (
            data.ongoing === false ||
            data.status?.toLowerCase() === "completed"
          ) {
            completed += 1;
          }

          initiativeHelped +=
            Number(data.peopleHelped) || 0;
        });

        setInitiativeCount(snapshot.size);
        setCompletedCount(completed);
        setInitiativePeopleHelped(initiativeHelped);

        initiativesLoaded = true;

        if (impactsLoaded) {
          setLoading(false);
        }
      },
      (error) => {
        console.log("DASHBOARD INITIATIVES ERROR:", error);
        initiativesLoaded = true;

        if (impactsLoaded) {
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeImpacts();
      unsubscribeInitiatives();
    };
  }, []);

  const ongoingCount = Math.max(
    initiativeCount - completedCount,
    0
  );

  const completionPercentage =
    initiativeCount > 0
      ? Math.round(
          (completedCount / initiativeCount) * 100
        )
      : 0;

  const StatCard = ({
    icon,
    title,
    value,
    background,
    iconColor,
  }) => (
    <View style={styles.statCard}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={iconColor}
        />
      </View>

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#23845B" />

        <Text style={styles.loadingText}>
          Gathering your impact...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            YOUR JOURNEY 🌱
          </Text>

          <Text style={styles.heading}>
            Impact Dashboard
          </Text>

          <Text style={styles.subtitle}>
            Small actions. Big change.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="leaf"
            size={30}
            color="#23845B"
          />
        </View>
      </View>

      {/* IMPACT OVERVIEW */}
      <Text style={styles.sectionTitle}>
        Your Impact
      </Text>

      <View style={styles.statsGrid}>
        <StatCard
          icon="heart"
          title="Impacts Created"
          value={impactCount}
          background="#FCE7EE"
          iconColor="#E83263"
        />

        <StatCard
          icon="people"
          title="People Helped"
          value={peopleHelped}
          background="#E3F0FC"
          iconColor="#287BB5"
        />
      </View>

      {/* INITIATIVE OVERVIEW */}
      <Text style={styles.sectionTitle}>
        Your Initiatives
      </Text>

      <View style={styles.statsGrid}>
        <StatCard
          icon="leaf"
          title="Created"
          value={initiativeCount}
          background="#E4F4E9"
          iconColor="#23845B"
        />

        <StatCard
          icon="trophy"
          title="Completed"
          value={completedCount}
          background="#FFF0D5"
          iconColor="#C68A19"
        />
      </View>

      {/* PROGRESS CARD */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>
              Initiative Progress
            </Text>

            <Text style={styles.progressSubtitle}>
              Every completed initiative makes a difference.
            </Text>
          </View>

          <Text style={styles.progressPercentage}>
            {completionPercentage}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${completionPercentage}%` },
            ]}
          />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressDetail}>
            🟢 {ongoingCount} Ongoing
          </Text>

          <Text style={styles.progressDetail}>
            🏆 {completedCount} Completed
          </Text>
        </View>
      </View>

      {/* INITIATIVE PEOPLE HELPED */}
      <View style={styles.peopleCard}>
        <View style={styles.peopleIcon}>
          <Ionicons
            name="hand-left"
            size={27}
            color="#23845B"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.peopleTitle}>
            Initiative People Helped
          </Text>

          <Text style={styles.peopleSubtitle}>
            People helped through initiatives you created.
          </Text>
        </View>

        <Text style={styles.peopleNumber}>
          {initiativePeopleHelped}
        </Text>
      </View>

      {/* RECENT ACTIVITY SHORTCUT */}
      <TouchableOpacity
        style={styles.activityButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("MyImpacts")}
      >
        <View style={styles.activityIcon}>
          <Ionicons
            name="time-outline"
            size={23}
            color="#23845B"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.activityTitle}>
            My Impact History
          </Text>

          <Text style={styles.activitySubtitle}>
            Revisit your impact posts and contributions.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#23845B"
        />
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Every act of kindness counts. 💚
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F8F5",
  },

  loadingText: {
    marginTop: 12,
    color: "#66766B",
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#23845B",
    marginBottom: 8,
  },

  heading: {
    fontSize: 27,
    fontWeight: "900",
    color: "#20372A",
  },

  subtitle: {
    fontSize: 14,
    color: "#718075",
    marginTop: 6,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#E4F4E9",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#20372A",
    marginBottom: 13,
  },

  statsGrid: {
    flexDirection: "row",
    gap: 13,
    marginBottom: 27,
  },

  statCard: {
    flex: 1,
    minHeight: 145,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5EDE6",
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statValue: {
    fontSize: 27,
    fontWeight: "900",
    color: "#20372A",
  },

  statTitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#718075",
    marginTop: 4,
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    borderWidth: 1,
    borderColor: "#E1EDE2",
    marginBottom: 17,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  progressTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#20372A",
  },

  progressSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#718075",
    marginTop: 5,
    paddingRight: 8,
  },

  progressPercentage: {
    fontSize: 25,
    fontWeight: "900",
    color: "#23845B",
  },

  progressTrack: {
    height: 10,
    backgroundColor: "#E8EFE8",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#23845B",
    borderRadius: 10,
  },

  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 13,
  },

  progressDetail: {
    fontSize: 12,
    fontWeight: "700",
    color: "#65766A",
    marginTop: 4,
  },

  peopleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF5EC",
    borderRadius: 20,
    padding: 16,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#D7EADC",
  },

  peopleIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  peopleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#20372A",
  },

  peopleSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#718075",
    marginTop: 4,
  },

  peopleNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#23845B",
    marginLeft: 8,
  },

  activityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5EDE6",
  },

  activityIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#E4F4E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#20372A",
  },

  activitySubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#718075",
    marginTop: 4,
  },

  footerText: {
    textAlign: "center",
    color: "#819085",
    fontSize: 12,
    marginTop: 25,
  },
});