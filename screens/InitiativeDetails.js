
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InitiativeDetails({ route, navigation }) {
      const initiative = route?.params?.initiative;

      const currentUser = auth.currentUser;

    const isCreator =
    !!currentUser && currentUser.uid === initiative?.userId;


const [peopleHelped, setPeopleHelped] = useState(
  Number(initiative?.peopleHelped || 0)
);
const [peopleHelpedInput, setPeopleHelpedInput] = useState(
  String(Number(initiative?.peopleHelped || 0))
);

const peopleTarget = Number(initiative?.peopleTarget || 0);

const joinedCount = Number(initiative?.joinedCount || 0);

const [displayJoinedCount, setDisplayJoinedCount] = useState(
  Number(initiative?.joinedCount || 0)
);

  
const [hasJoined, setHasJoined] = useState(false);
const [savingProgress, setSavingProgress] = useState(false);
const [isCompleted, setIsCompleted] = useState(
  initiative?.ongoing === false
);
const [joining, setJoining] = useState(false);

useEffect(() => {
  let active = true;

  const checkParticipation = async () => {
    const user = auth.currentUser;

    if (!user || !initiative?.id) return;

    try {
      const participantRef = doc(
        db,
        "initiatives",
        initiative.id,
        "participants",
        user.uid
      );

      const participantSnapshot = await getDoc(participantRef);

      if (active) {
        setHasJoined(participantSnapshot.exists());
      }
    } catch (error) {
      console.log("CHECK INITIATIVE PARTICIPATION ERROR:", error);
    }
  };

  checkParticipation();

  return () => {
    active = false;
  };
}, [initiative?.id]);



const handleJoinInitiative = async () => {
  const user = auth.currentUser;

  if (!user) {
    Alert.alert("Login required", "Please log in to join this initiative.");
    return;
  }

  if (!initiative?.id || joining || hasJoined || !isOngoing) {
    return;
  }

  setJoining(true);

  try {
    const initiativeRef = doc(db, "initiatives", initiative.id);
    const participantRef = doc(
      db,
      "initiatives",
      initiative.id,
      "participants",
      user.uid
    );

    const joined = await runTransaction(db, async (transaction) => {
      const participantSnapshot = await transaction.get(participantRef);

      if (participantSnapshot.exists()) {
        return false;
      }

      const initiativeSnapshot = await transaction.get(initiativeRef);

      if (!initiativeSnapshot.exists()) {
        throw new Error("INITIATIVE_NOT_FOUND");
      }

      const currentCount = Number(
        initiativeSnapshot.data().joinedCount || 0
      );

      transaction.set(participantRef, {
        userId: user.uid,
        initiativeId: initiative.id,
        joinedAt: new Date(),
      });

      transaction.update(initiativeRef, {
        joinedCount: currentCount + 1,
      });

      return true;
    });

    setHasJoined(true);
    setDisplayJoinedCount(prev => prev + 1);

    if (joined) {
      Alert.alert(
        "Welcome aboard! 🌱",
        "You've successfully joined this initiative."
      );
    } else {
      Alert.alert(
        "Already joined",
        "You're already part of this initiative."
      );
    }
  } catch (error) {
    console.log("JOIN INITIATIVE ERROR:", error);

    Alert.alert(
      "Unable to join",
      error.message === "INITIATIVE_NOT_FOUND"
        ? "This initiative could not be found."
        : "Joining failed. Please check your Firestore permissions and try again."
    );
  } finally {
    setJoining(false);
  }
};


const handleUpdatePeopleHelped = async () => {
  if (!isCreator) {
    Alert.alert(
      "Not allowed",
      "Only the initiative creator can update progress."
    );
    return;
  }

  if (savingProgress || isCompleted) return;

  const value = peopleHelpedInput.trim();
  const updatedCount = Number(value);

  if (
    value === "" ||
    !Number.isSafeInteger(updatedCount) ||
    updatedCount < 0
  ) {
    Alert.alert(
      "Invalid number",
      "Please enter a valid whole number, zero or greater."
    );
    return;
  }

  setSavingProgress(true);

  try {
    const initiativeRef = doc(db, "initiatives", initiative.id);

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(initiativeRef);

      if (!snapshot.exists()) {
        throw new Error("INITIATIVE_NOT_FOUND");
      }

      const data = snapshot.data();

      if (data.userId !== auth.currentUser?.uid) {
        throw new Error("NOT_CREATOR");
      }

      if (data.ongoing === false) {
        throw new Error("INITIATIVE_COMPLETED");
      }

      transaction.update(initiativeRef, {
        peopleHelped: updatedCount,
        updatedAt: new Date(),
      });
    });

    setPeopleHelped(updatedCount);

    Alert.alert(
      "Progress updated",
      "People Helped has been updated successfully."
    );
  } catch (error) {
    console.log("UPDATE INITIATIVE PROGRESS ERROR:", error);

    Alert.alert(
      "Update failed",
      error.message === "NOT_CREATOR"
        ? "Only the initiative creator can update progress."
        : error.message === "INITIATIVE_COMPLETED"
        ? "This initiative is already completed."
        : "Could not update progress. Please try again."
    );
  } finally {
    setSavingProgress(false);
  }
};

const handleCompleteInitiative = () => {
  if (!isCreator) {
    Alert.alert(
      "Not allowed",
      "Only the initiative creator can complete this initiative."
    );
    return;
  }

  if (savingProgress || isCompleted) return;

  Alert.alert(
    "Complete Initiative",
    "Are you sure you want to mark this initiative as completed?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          setSavingProgress(true);

          try {
            const initiativeRef = doc(
              db,
              "initiatives",
              initiative.id
            );

            await runTransaction(db, async (transaction) => {
              const snapshot = await transaction.get(initiativeRef);

              if (!snapshot.exists()) {
                throw new Error("INITIATIVE_NOT_FOUND");
              }

              const data = snapshot.data();

              if (data.userId !== auth.currentUser?.uid) {
                throw new Error("NOT_CREATOR");
              }

              if (data.ongoing === false) {
                throw new Error("INITIATIVE_COMPLETED");
              }

              transaction.update(initiativeRef, {
                ongoing: false,
                status: "completed",
                updatedAt: new Date(),
              });
            });

            setIsCompleted(true);

            Alert.alert(
              "Initiative Completed 🎉",
              "Thank you for making a positive difference!"
            );
          } catch (error) {
            console.log("COMPLETE INITIATIVE ERROR:", error);

            Alert.alert(
              "Unable to complete",
              "The initiative could not be updated. Please try again."
            );
          } finally {
            setSavingProgress(false);
          }
        },
      },
    ]
  );
};


  if (!initiative) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Initiative details are unavailable.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }


  const progress =
    peopleTarget > 0
      ? Math.min((peopleHelped / peopleTarget) * 100, 100)
      : 0;

  const isOngoing = initiative.ongoing !== false;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF8" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={23} color="#25352D" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Initiative Details</Text>

        <View style={styles.iconButton}>
          <Ionicons name="heart-outline" size={23} color="#B76E79" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {initiative.imageUrl ? (
          <Image
            source={{ uri: initiative.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="people-outline" size={58} color="#B6A58A" />
            <Text style={styles.placeholderText}>Community Initiative</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.category}>
              {initiative.category || "Community"}
            </Text>

            <View
              style={[
                styles.statusBadge,
                !isOngoing && styles.completedBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  !isOngoing && styles.completedText,
                ]}
              >
                {isOngoing ? "Ongoing" : "Completed"}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            {initiative.title || "Untitled Initiative"}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#B76E79" />
            <Text style={styles.location}>
              {initiative.location || "Location not specified"}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About this initiative</Text>
          <Text style={styles.description}>
            {initiative.description || "No description available yet."}
          </Text>

          <Text style={styles.sectionTitle}>Community impact</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color="#B76E79" />
              <Text style={styles.statNumber}>{displayJoinedCount}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="heart-outline" size={24} color="#B76E79" />
              <Text style={styles.statNumber}>{peopleHelped}</Text>
              <Text style={styles.statLabel}>People helped</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="flag-outline" size={24} color="#B76E79" />
              <Text style={styles.statNumber}> 
                {peopleTarget > 0 ? peopleTarget : "—"}
              </Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
          </View>

          {peopleTarget > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressTitle}>Impact progress</Text>
                <Text style={styles.progressPercent}>
                  {Math.round(progress)}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.progressCaption}>
                {peopleHelped} of {peopleTarget} people helped
              </Text>
            </View>
          )}


      {/* Creator Progress Controls */}
      {isCreator && !isCompleted && (
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>
            Update Community Impact
          </Text>

          <Text style={styles.progressCaption}>
            Enter the total number of people helped so far.
          </Text>

          <TextInput
            style={styles.progressInput}
            value={peopleHelpedInput}
            onChangeText={setPeopleHelpedInput}
            keyboardType="number-pad"
            placeholder="Enter people helped"
            placeholderTextColor="#8A8A8A"
          />

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleUpdatePeopleHelped}
            disabled={savingProgress}
            activeOpacity={0.85}
          >
            <Text style={styles.joinButtonText}>
              {savingProgress ? "Saving..." : "Update Progress"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      
{isCreator && !isCompleted && (
  <TouchableOpacity
    style={styles.joinButton}
    onPress={handleCompleteInitiative}
    disabled={savingProgress}
    activeOpacity={0.85}
  >
    <Text style={styles.joinButtonText}>
      {savingProgress ? "Saving..." : "Mark Initiative Completed"}
    </Text>
  </TouchableOpacity>
)}


          
<TouchableOpacity
  style={[
    styles.joinButton,
    hasJoined && styles.joinedButton,
  ]}
  onPress={handleJoinInitiative}
  disabled={joining || hasJoined || !isOngoing}
  activeOpacity={0.85}
>
  <Ionicons
    name={hasJoined ? "checkmark-circle" : "people-outline"}
    size={21}
    color="#FFFFFF"
  />
  <Text style={styles.joinButtonText}>
    {joining
      ? "Joining..."
      : hasJoined
      ? "You're Joined"
      : !isOngoing
      ? "Initiative Completed"
      : "Join Initiative"}
  </Text>
</TouchableOpacity>


          <View style={styles.noteCard}>
            <Ionicons name="sparkles-outline" size={25} color="#B08D57" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Every action matters</Text>
              <Text style={styles.noteText}>
                Small acts of kindness can create meaningful change in a
                community.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F5F0E7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#25352D",
  },
  heroImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#F0E9DE",
  },
  imagePlaceholder: {
    height: 220,
    backgroundColor: "#F5F0E7",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  placeholderText: {
    color: "#7A7468",
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B76E79",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statusBadge: {
    backgroundColor: "#E6F2E7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedBadge: {
    backgroundColor: "#F0E9DE",
  },
  statusText: {
    color: "#39734B",
    fontSize: 12,
    fontWeight: "700",
  },
  completedText: {
    color: "#776C5A",
  },
  title: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: "800",
    color: "#25352D",
    marginTop: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  location: {
    flex: 1,
    color: "#77756E",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#EDE6DA",
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#25352D",
    marginBottom: 12,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 25,
    color: "#66665F",
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 115,
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 18,
    backgroundColor: "#F7F2E9",
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 21,
    fontWeight: "800",
    color: "#25352D",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#77756E",
    textAlign: "center",
    marginTop: 4,
  },
  progressSection: {
    marginTop: 28,
    marginBottom: 24,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#25352D",
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#B76E79",
  },
  progressTrack: {
    height: 9,
    borderRadius: 10,
    backgroundColor: "#EDE6DA",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#B76E79",
  },
  progressCaption: {
    fontSize: 12,
    color: "#77756E",
    marginTop: 8,
  },
  
      progressInput: {
        borderWidth: 1,
        borderColor: "#E6D8D0",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: "#25352D",
        marginTop: 12,
        marginBottom: 12,
      },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F1E4",
    padding: 17,
    borderRadius: 18,
    marginTop: 8,
    gap: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#25352D",
    marginBottom: 5,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#716B5F",
  },
  center: {
    flex: 1,
    backgroundColor: "#FFFDF8",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#25352D",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#25352D",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  
joinButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#25352D",
  paddingVertical: 17,
  borderRadius: 16,
  marginTop: 24,
  marginBottom: 24,
  gap: 10,
},
joinedButton: {
  backgroundColor: "#64816B",
},
joinButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
},

});
