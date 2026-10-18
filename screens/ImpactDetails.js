import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";

import { db, auth } from "../firebase";

import {
  doc,
  getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove,
} from "firebase/firestore";

export default function ImpactDetails({ route, navigation }) {
  const { impactId } = route.params;

  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwner = impact?.userId === auth.currentUser?.uid;

  const formatImpactDate = (timestamp) => {
  if (!timestamp?.toDate) {
    return "";
  }

  const date = timestamp.toDate();
  const now = new Date();

  const difference =
    Math.floor((now - date) / (1000 * 60 * 60 * 24));

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

  const handleLike = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser || !impact) {
    return;
  }

  try {
    const impactRef = doc(db, "impacts", impact.id);

    const alreadyLiked =
      impact.likedBy?.includes(currentUser.uid);

    if (alreadyLiked) {
      await updateDoc(impactRef, {
        likes: Math.max((impact.likes || 0) - 1, 0),
        likedBy: arrayRemove(currentUser.uid),
      });

      setImpact((prev) => ({
        ...prev,
        likes: Math.max((prev.likes || 0) - 1, 0),
        likedBy: (prev.likedBy || []).filter(
          (uid) => uid !== currentUser.uid
        ),
      }));
    } else {
      await updateDoc(impactRef, {
        likes: (impact.likes || 0) + 1,
        likedBy: arrayUnion(currentUser.uid),
      });

      setImpact((prev) => ({
        ...prev,
        likes: (prev.likes || 0) + 1,
        likedBy: [...(prev.likedBy || []), currentUser.uid],
      }));
    }
  } catch (error) {
    console.log("IMPACT LIKE ERROR:", error);
  }
};

const handleSave = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser || !impact) {
    return;
  }

  try {
    const impactRef = doc(db, "impacts", impact.id);

    const alreadySaved =
      impact.savedBy?.includes(currentUser.uid);

    if (alreadySaved) {
      await updateDoc(impactRef, {
        savedBy: arrayRemove(currentUser.uid),
      });

      setImpact((prev) => ({
        ...prev,
        savedBy: (prev.savedBy || []).filter(
          (uid) => uid !== currentUser.uid
        ),
      }));
    } else {
      await updateDoc(impactRef, {
        savedBy: arrayUnion(currentUser.uid),
      });

      setImpact((prev) => ({
        ...prev,
        savedBy: [
          ...(prev.savedBy || []),
          currentUser.uid,
        ],
      }));
    }
  } catch (error) {
    console.log("IMPACT SAVE ERROR:", error);
  }
};

const handleShare = async () => {
  if (!impact) {
    return;
  }

  try {
    const message =
      `❤️ ${impact.action || "Impact"}\n\n` +
      `${impact.story || ""}\n\n` +
      `📍 ${impact.location || "Location not added"}\n` +
      `👥 ${impact.peopleHelped || "0"} people helped\n\n` +
      `Shared from Moments 🌱`;

    await Share.share({
      message: message,
    });
  } catch (error) {
    console.log("IMPACT SHARE ERROR:", error);
  }
};
 
  useEffect(() => {
    const loadImpact = async () => {
      try {
        const impactRef = doc(db, "impacts", impactId);
        const impactSnapshot = await getDoc(impactRef);

        if (impactSnapshot.exists()) {
          setImpact({
            id: impactSnapshot.id,
            ...impactSnapshot.data(),
          });
        }
      } catch (error) {
        console.log("IMPACT DETAILS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImpact();
  }, [impactId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#E83263"
        />

        <Text style={styles.loadingText}>
          Loading Impact...
        </Text>
      </View>
    );
  }

  if (!impact) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>❤️</Text>

        <Text style={styles.emptyTitle}>
          Impact not found
        </Text>

        <Text style={styles.emptyText}>
          This Impact may have been removed.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
<View style={styles.topHeader}>
  <TouchableOpacity
    style={styles.backButton}
    activeOpacity={0.8}
    onPress={() => navigation.goBack()}
  >
    <Text style={styles.backArrow}>‹</Text>
  </TouchableOpacity>

  <Text style={styles.topTitle}>
    Impact Details
  </Text>

  {isOwner ? (
    <TouchableOpacity
      style={styles.moreButton}
      activeOpacity={0.8}
      onPress={() => {
  Alert.alert(
    "Impact Options",
    "What would you like to do?",
    [
      {
  text: "EDIT IMPACT",
  onPress: () => {
    navigation.navigate("EditImpact", {
      impactId: impactId,
    });
  },
},
      {
  text: "Delete Impact",
  onPress: async () => {
    try {
      await deleteDoc(
        doc(db, "impacts", impactId)
      );

      Alert.alert(
        "Impact Deleted ❤️",
        "Your Impact has been deleted successfully.",
        [
          {
            text: "DONE",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log("DELETE IMPACT ERROR:", error);

      Alert.alert(
        "Delete Failed",
        "We couldn't delete this Impact. Please try again."
      );
    }
  },
  style: "destructive",
},
      {
        text: "Cancel",
        style: "cancel",
      },
    ]
  );
}}
    >
      <Text style={styles.moreIcon}>⋮</Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.headerSpacer} />
  )}
</View>

{/* Impact Header */}
<View style={styles.header}>
  <View style={styles.heartCircle}>
    <Text style={styles.heart}>❤️</Text>
  </View>

  <View style={{ flex: 1 }}>
    <Text style={styles.category}>
      {impact.category || "Impact"}
    </Text>

    <Text style={styles.location}>
      📍 {impact.location || "Location not added"}
    </Text>
  </View>
</View>

{/* Creator */}
<View style={styles.creatorRow}>
  {impact.userPhoto ? (
    <Image
      source={{ uri: impact.userPhoto }}
      style={styles.creatorPhoto}
    />
  ) : (
    <View style={styles.creatorPlaceholder}>
      <Text style={styles.creatorPlaceholderText}>
        {impact.userName?.charAt(0)?.toUpperCase() || "U"}
      </Text>
    </View>
  )}

  <View style={{ flex: 1 }}>
    <Text style={styles.creatorName}>
      {impact.userName || "Unknown User"}
    </Text>

    <Text style={styles.createdTime}>
      {formatImpactDate(impact.createdAt)}
    </Text>
  </View>
</View>

      {/* Main Action */}
      <Text style={styles.action}>
        {impact.action || "Impact action"}
      </Text>

      {/* Story */}
      {impact.story ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About this Impact
          </Text>

          <Text style={styles.story}>
            {impact.story}
          </Text>
        </View>
      ) : null}

      {/* Image */}
      {impact.imageUrl ? (
        <Image
          source={{ uri: impact.imageUrl }}
          style={styles.impactImage}
        />
      ) : null}

      {/* People Helped */}
      <View style={styles.helpBox}>
        <Text style={styles.helpIcon}>👥</Text>

        <View>
          <Text style={styles.helpNumber}>
            {impact.peopleHelped || "0"}
          </Text>

          <Text style={styles.helpLabel}>
            People Helped
          </Text>
        </View>
      </View>

     {/* Stats */}
<View style={styles.statsCard}>
  <TouchableOpacity
    style={styles.stat}
    activeOpacity={0.7}
    onPress={handleLike}
  >
    <Text style={styles.statIcon}>
      {impact.likedBy?.includes(auth.currentUser?.uid)
        ? "❤️"
        : "🤍"}
    </Text>

    <Text style={styles.statNumber}>
      {impact.likes || 0}
    </Text>

    <Text style={styles.statLabel}>
      Likes
    </Text>
  </TouchableOpacity>

  <View style={styles.divider} />

  <TouchableOpacity
  style={styles.stat}
  activeOpacity={0.7}
  onPress={() =>
    navigation.navigate("ImpactComments", {
      impactId: impact.id,
    })
  }
>
  <Text style={styles.statIcon}>💬</Text>

  <Text style={styles.statNumber}>
    {impact.comments || 0}
  </Text>

  <Text style={styles.statLabel}>
    Comments
  </Text>
</TouchableOpacity>
</View>

<TouchableOpacity
  style={styles.saveButton}
  activeOpacity={0.8}
  onPress={handleSave}
>
  <Text style={styles.saveIcon}>
    {impact.savedBy?.includes(auth.currentUser?.uid)
      ? "🔖"
      : "🔖"}
  </Text>

  <Text style={styles.saveText}>
    {impact.savedBy?.includes(auth.currentUser?.uid)
      ? "Saved"
      : "Save Impact"}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.shareButton}
  activeOpacity={0.8}
  onPress={handleShare}
>
  <Text style={styles.shareIcon}>↗️</Text>

  <Text style={styles.shareText}>
    Share Impact
  </Text>
</TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 18,
    paddingTop: 55,
  },

  center: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#687386",
  },

  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#687386",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  heartCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FCE8EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  heart: {
    fontSize: 28,
  },

  category: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E83263",
  },

  location: {
    fontSize: 13,
    color: "#687386",
    marginTop: 5,
  },

  action: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 22,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECF2",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A44",
    marginBottom: 9,
  },

  story: {
    fontSize: 15,
    lineHeight: 23,
    color: "#5F6978",
  },

  impactImage: {
    width: "100%",
    height: 230,
    borderRadius: 18,
    marginBottom: 16,
  },

  helpBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECF2",
    marginBottom: 16,
  },

  helpIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  helpNumber: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1F2A44",
  },

  helpLabel: {
    fontSize: 13,
    color: "#687386",
    marginTop: 2,
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECF2",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statIcon: {
    fontSize: 20,
    marginBottom: 5,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2A44",
  },

  statLabel: {
    fontSize: 12,
    color: "#687386",
    marginTop: 3,
  },

  divider: {
    width: 1,
    height: 45,
    backgroundColor: "#E9ECF2",
  },

  bottomSpace: {
    height: 35,
  },

  topHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 25,
},

backButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E9ECF2",
},

backArrow: {
  fontSize: 36,
  lineHeight: 38,
  color: "#1F2A44",
  marginTop: -4,
},

topTitle: {
  fontSize: 18,
  fontWeight: "800",
  color: "#1F2A44",
},

headerSpacer: {
  width: 44,
},

moreButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E9ECF2",
},

moreIcon: {
  fontSize: 28,
  fontWeight: "800",
  color: "#1F2A44",
  marginTop: -5,
},

saveButton: {
  marginTop: 16,
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  minHeight: 58,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#E9ECF2",
},

saveIcon: {
  fontSize: 22,
  marginRight: 9,
},

saveText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#1F2A44",
},

shareButton: {
  marginTop: 12,
  backgroundColor: "#1F2A44",
  borderRadius: 18,
  minHeight: 58,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

shareIcon: {
  fontSize: 21,
  marginRight: 9,
},

shareText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#FFFFFF",
},

creatorRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 18,
},

creatorPhoto: {
  width: 42,
  height: 42,
  borderRadius: 21,
  marginRight: 11,
},

creatorPlaceholder: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#FCE8EE",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 11,
},

creatorPlaceholderText: {
  fontSize: 17,
  fontWeight: "800",
  color: "#E83263",
},

creatorName: {
  fontSize: 15,
  fontWeight: "800",
  color: "#1F2A44",
},

createdTime: {
  fontSize: 12,
  color: "#687386",
  marginTop: 3,
},

});