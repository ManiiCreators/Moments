import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { db, auth } from "../firebase";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
  setDoc,
} from "firebase/firestore";


export default function Impact({ navigation }) {

  const [impacts, setImpacts] = useState([]);
  const [savedImpacts, setSavedImpacts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  // ==========================================
  // LOAD IMPACTS
  // ==========================================

  useEffect(() => {

    const q = query(
      collection(db, "impacts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setImpacts(data);
        setLoading(false);
        setRefreshing(false);
      },

      (error) => {

        console.log(
          "LOAD IMPACTS ERROR:",
          error
        );

        setLoading(false);
        setRefreshing(false);

        Alert.alert(
          "Unable to load Impacts",
          error.message ||
            "Something went wrong."
        );
      }
    );

    return () => unsubscribe();

  }, []);


  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {

    setRefreshing(true);

    // Firestore onSnapshot automatically
    // refreshes the data.
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };


  // ==========================================
  // DELETE IMPACT
  // ==========================================

  const deleteImpact = (impact) => {

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert(
        "Login required",
        "Please login first."
      );
      return;
    }

    if (
      impact.userId !== currentUser.uid
    ) {
      Alert.alert(
        "Not allowed",
        "You can only delete your own Impact."
      );
      return;
    }


    Alert.alert(
      "Delete Impact?",
      "This Impact will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {

            try {

              await deleteDoc(
                doc(db, "impacts", impact.id)
              );

              Alert.alert(
                "Deleted",
                "Your Impact has been deleted."
              );

            } catch (error) {

              console.log(
                "DELETE IMPACT ERROR:",
                error
              );

              Alert.alert(
                "Unable to delete",
                error.message ||
                  "Something went wrong."
              );
            }
          },
        },
      ]
    );
  };


  // ==========================================
// LIKE / UNLIKE IMPACT
// ==========================================

const toggleLike = async (impact) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    Alert.alert(
      "Login required",
      "Please login first."
    );
    return;
  }

  try {
    const impactRef = doc(db, "impacts", impact.id);

    const likedBy = impact.likedBy || [];

    const alreadyLiked = likedBy.includes(
      currentUser.uid
    );

    if (alreadyLiked) {
      await updateDoc(impactRef, {
        likedBy: arrayRemove(currentUser.uid),
        likes: increment(-1),
      });
    } else {
      await updateDoc(impactRef, {
        likedBy: arrayUnion(currentUser.uid),
        likes: increment(1),
      });
    }

  } catch (error) {

    console.log(
      "LIKE IMPACT ERROR:",
      error
    );

    Alert.alert(
      "Unable to like Impact",
      error.message ||
        "Something went wrong."
    );
  }
};

  // ==========================================
  // OPEN PROFILE
  // ==========================================

  const openProfile = (impact) => {

    navigation.navigate(
      "UserProfile",
      {
        user: {
          id: impact.userId,
          uid: impact.userId,
          name: impact.userName,
          photoURL: impact.userPhoto,
        },
      }
    );
  };


  // ==========================================
  // OPEN COMMENTS
  // ==========================================

  const openComments = (impact) => {

    navigation.navigate(
      "Comment",
      {
        postId: impact.id,
        impactId: impact.id,
        type: "impact",
      }
    );
  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (timestamp) => {

    if (!timestamp) {
      return "Just now";
    }

    try {

      const date =
        timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

      const now = new Date();

      const difference =
        now.getTime() -
        date.getTime();

      const minutes =
        Math.floor(
          difference / 60000
        );

      if (minutes < 1) {
        return "Just now";
      }

      if (minutes < 60) {
        return `${minutes}m ago`;
      }

      const hours =
        Math.floor(minutes / 60);

      if (hours < 24) {
        return `${hours}h ago`;
      }

      const days =
        Math.floor(hours / 24);

      if (days < 7) {
        return `${days}d ago`;
      }

      return date.toLocaleDateString();

    } catch (error) {

      return "Recently";
    }
  };


  // ==========================================
  // IMPACT CARD
  // ==========================================

  const renderImpact = ({
    item,
  }) => {

    const currentUser =
      auth.currentUser;

    const isOwner =
      currentUser &&
      item.userId === currentUser.uid;


    return (

      <View style={styles.card}>

        {/* ===============================
            USER HEADER
        =============================== */}

        <View style={styles.userRow}>

          <TouchableOpacity
            onPress={() =>
              openProfile(item)
            }
            activeOpacity={0.8}
          >

            <Image
              source={
                item.userPhoto
                  ? {
                      uri: item.userPhoto,
                    }
                  : require("../assets/icon.png")
              }
              style={styles.avatar}
            />

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.userInfo}
            onPress={() =>
              openProfile(item)
            }
            activeOpacity={0.8}
          >

            <Text
              style={styles.userName}
              numberOfLines={1}
            >
              {item.userName ||
                "Moments Member"}
            </Text>

            <Text style={styles.time}>
              {formatDate(
                item.createdAt
              )}
            </Text>

          </TouchableOpacity>


          {isOwner && (

            <TouchableOpacity
              style={styles.moreButton}
              onPress={() =>
                deleteImpact(item)
              }
            >

              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color="#665C55"
              />

            </TouchableOpacity>

          )}

        </View>


        {/* ===============================
            CATEGORY
        =============================== */}

        {item.category && (

          <View style={styles.categoryBadge}>

            <Text
              style={styles.categoryText}
            >
              {item.category}
            </Text>

          </View>

        )}


        {/* ===============================
            ACTION
        =============================== */}

        <Text style={styles.action}>
          {item.action}
        </Text>


        {/* ===============================
            STORY
        =============================== */}

        {item.story ? (

          <Text
            style={styles.story}
          >
            {item.story}
          </Text>

        ) : null}


        {/* ===============================
            PHOTO
        =============================== */}

        {item.imageUrl ? (

          <Image
            source={{
              uri: item.imageUrl,
            }}
            style={styles.impactImage}
          />

        ) : null}


        {/* ===============================
            LOCATION + PEOPLE
        =============================== */}

        <View style={styles.detailsRow}>

          {item.location ? (

            <View style={styles.detailItem}>

              <Ionicons
                name="location-outline"
                size={17}
                color="#8A6330"
              />

              <Text
                style={styles.detailText}
                numberOfLines={1}
              >
                {item.location}
              </Text>

            </View>

          ) : null}


          {item.peopleHelped &&
            item.peopleHelped !== "0" ? (

            <View style={styles.detailItem}>

              <Ionicons
                name="people-outline"
                size={17}
                color="#8A6330"
              />

              <Text
                style={styles.detailText}
              >
                {item.peopleHelped} helped
              </Text>

            </View>

          ) : null}

        </View>


        {/* ===============================
            IMPACT MESSAGE
        =============================== */}

        <View style={styles.impactMessage}>

          <View style={styles.impactIcon}>

            <Text style={styles.heart}>
              ❤️
            </Text>

          </View>

          <Text style={styles.impactMessageText}>
            Every good action can inspire
            another.
          </Text>

        </View>


        {/* ===============================
            STATS
        =============================== */}

        <View style={styles.statsRow}>

          <TouchableOpacity
  style={styles.stat}
  onPress={() => toggleLike(item)}
  activeOpacity={0.7}
>
  <Ionicons
    name={
      item.likedBy &&
      auth.currentUser &&
      item.likedBy.includes(auth.currentUser.uid)
        ? "heart"
        : "heart-outline"
    }
    size={21}
    color="#E83263"
  />

  <Text style={styles.statText}>
    {item.likes || 0}
  </Text>
</TouchableOpacity>


          <TouchableOpacity
            style={styles.stat}
            onPress={() =>
              openComments(item)
            }
          >

            <Ionicons
              name="chatbubble-outline"
              size={19}
              color="#665C55"
            />

            <Text style={styles.statText}>
              {item.comments || 0}
            </Text>

          </TouchableOpacity>


          <View style={styles.statSpacer} />


         <TouchableOpacity
  onPress={() => toggleSave(item)}
  activeOpacity={0.7}
>
  <Ionicons
    name={
      savedImpacts[item.id]
        ? "bookmark"
        : "bookmark-outline"
    }
    size={26}
    color={
      savedImpacts[item.id]
        ? "#E83263"
        : "#555"
    }
  />
</TouchableOpacity>

        </View>

      </View>
    );
  };


  // ==========================================
// SAVE / UNSAVE IMPACT
// ==========================================

const toggleSave = async (impact) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    Alert.alert(
      "Login required",
      "Please login first."
    );
    return;
  }

  try {
    const saveRef = doc(
      db,
      "impacts",
      impact.id,
      "saves",
      currentUser.uid
    );

    const isSaved = savedImpacts[impact.id] === true;

    if (isSaved) {
      await deleteDoc(saveRef);

      setSavedImpacts((prev) => ({
        ...prev,
        [impact.id]: false,
      }));
    } else {
      await setDoc(saveRef, {
        userId: currentUser.uid,
        impactId: impact.id,
        createdAt: new Date(),
      });

      setSavedImpacts((prev) => ({
        ...prev,
        [impact.id]: true,
      }));
    }

  } catch (error) {
    console.log("SAVE IMPACT ERROR:", error);

    Alert.alert(
      "Unable to save Impact",
      error.message || "Something went wrong."
    );
  }
};

  // ==========================================
  // EMPTY STATE
  // ==========================================

  const renderEmpty = () => {

    if (loading) {
      return null;
    }

    return (

      <View style={styles.empty}>

        <View style={styles.emptyIcon}>

          <Text style={styles.emptyHeart}>
            ❤️
          </Text>

        </View>

        <Text style={styles.emptyTitle}>
          No Impacts yet
        </Text>

        <Text style={styles.emptyText}>
          Be the first person to share
          a good action with the community.
        </Text>


        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            navigation.navigate(
              "CreateImpact"
            )
          }
        >

          <Ionicons
            name="add"
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={styles.createButtonText}
          >
            Create Impact
          </Text>

        </TouchableOpacity>

      </View>
    );
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View style={styles.loading}>

          <ActivityIndicator
            size="large"
            color="#E83263"
          />

          <Text style={styles.loadingText}>
            Loading Impacts...
          </Text>

        </View>

      </SafeAreaView>
    );
  }


  // ==========================================
  // SCREEN
  // ==========================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <View>

          <Text style={styles.headerTitle}>
            Impact
          </Text>

          <Text style={styles.headerSubtitle}>
            Small actions. Big difference. 🌱
          </Text>

        </View>


        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate(
              "CreateImpact"
            )
          }
        >

          <Ionicons
            name="add"
            size={25}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>


      {/* ================= FEED ================= */}

      <FlatList
        data={impacts}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderImpact}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          impacts.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#E83263"
          />
        }
      />

    </SafeAreaView>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F7F5",
  },


  // ================= HEADER =================

  header: {
    backgroundColor: "#FFFFFF",
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE8E2",
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#2C241F",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#8A817A",
    marginTop: 3,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E83263",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },


  // ================= LIST =================

  listContent: {
    paddingTop: 10,
    paddingBottom: 35,
  },


  // ================= CARD =================

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ECE6E0",
    padding: 16,
    overflow: "hidden",
  },


  // ================= USER =================

  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0ECE8",
  },

  userInfo: {
    flex: 1,
    marginLeft: 11,
  },

  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2C241F",
  },

  time: {
    fontSize: 11,
    color: "#968C84",
    marginTop: 3,
  },

  moreButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },


  // ================= CATEGORY =================

  categoryBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: "#FCE8EE",
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C92754",
  },


  // ================= CONTENT =================

  action: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    color: "#2C241F",
    marginTop: 12,
  },

  story: {
    fontSize: 14,
    lineHeight: 21,
    color: "#655C55",
    marginTop: 7,
  },


  // ================= IMAGE =================

  impactImage: {
    width: "100%",
    height: 235,
    borderRadius: 17,
    marginTop: 14,
    backgroundColor: "#F2EEEA",
  },


  // ================= DETAILS =================

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 14,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    marginBottom: 4,
  },

  detailText: {
    fontSize: 12,
    color: "#6E655E",
    marginLeft: 5,
    maxWidth: 180,
  },


  // ================= MESSAGE =================

  impactMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7EE",
    borderRadius: 15,
    padding: 10,
    marginTop: 13,
  },

  impactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FCE8EE",
    alignItems: "center",
    justifyContent: "center",
  },

  heart: {
    fontSize: 16,
  },

  impactMessageText: {
    flex: 1,
    fontSize: 12,
    color: "#786E66",
    fontWeight: "600",
    marginLeft: 8,
  },


  // ================= STATS =================

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE7",
  },

  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 22,
  },

  statText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#665C55",
    marginLeft: 5,
  },

  statSpacer: {
    flex: 1,
  },


  // ================= EMPTY =================

  emptyContainer: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingTop: 100,
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#FCE8EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyHeart: {
    fontSize: 34,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2C241F",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#81776F",
    marginTop: 7,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E83263",
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    marginTop: 20,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },


  // ================= LOADING =================

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 14,
    color: "#81776F",
    marginTop: 10,
  },

});