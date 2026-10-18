import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import { useFocusEffect } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
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
  getDoc,
  setDoc,
} from "firebase/firestore";


export default function Impact({ navigation }) {


const [impacts, setImpacts] = useState([]);
const [savedImpacts, setSavedImpacts] = useState({});
const [loading, setLoading] = useState(true);

// Refresh saved bookmarks whenever the Impact screen is opened
useFocusEffect(
  useCallback(() => {
    let active = true;

    const loadSavedStatus = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setSavedImpacts({});
        return;
      }

      try {
        const snapshot = await getDocs(
          collection(db, "impacts")
        );

        const savedStatus = {};

        await Promise.all(
          snapshot.docs.map(async (impactDoc) => {
            const saveRef = doc(
              db,
              "impacts",
              impactDoc.id,
              "saves",
              currentUser.uid
            );

            const saveSnapshot = await getDoc(saveRef);

            if (saveSnapshot.exists()) {
              savedStatus[impactDoc.id] = true;
            }
          })
        );

        if (active) {
          setSavedImpacts(savedStatus);
        }
      } catch (error) {
        console.log(
          "LOAD SAVED IMPACT STATUS ERROR:",
          error
        );
      }
    };

    loadSavedStatus();

    return () => {
      active = false;
    };
  }, [])
);

const [refreshing, setRefreshing] = useState(false);
const [selectedCategory, setSelectedCategory] = useState("All");


const filteredImpacts =
  selectedCategory === "All"
    ? impacts
    : impacts.filter(
        (impact) => impact.category === selectedCategory
      );

  
const totalPeopleHelped = impacts.reduce((total, impact) => {
  return total + (parseInt(impact.peopleHelped, 10) || 0);
}, 0);

const totalActions = impacts.length;

const totalCities = new Set(
  impacts
    .map((impact) => (impact.location || "").trim().toLowerCase())
    .filter(Boolean)
).size;


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

       
      {typeof item.imageUrl === "string" &&
      item.imageUrl.trim().length > 0 ? (
      <Image
      source={{
      uri: item.imageUrl.trim(),
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

  <View style={styles.headerLeft}>

    <Text style={styles.headerTitle}>
      Impact 🌱
    </Text>

    <Text style={styles.headerSubtitle}>
      Small actions. Big difference. ✨
    </Text>

  </View>

  <View style={styles.headerActions}>

    <TouchableOpacity
      style={styles.searchButton}
      onPress={() => {}}
      activeOpacity={0.7}
    >
      <Ionicons
        name="search-outline"
        size={23}
        color="#2C241F"
      />
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.addButton}
      onPress={() =>
        navigation.navigate("CreateImpact")
      }
      activeOpacity={0.8}
    >
      <Ionicons
        name="add"
        size={27}
        color="#FFFFFF"
      />
    </TouchableOpacity>

  </View>

</View>




      {/* ================= FEED ================= */}

      <FlatList
        
      data={filteredImpacts}
      keyExtractor={(item) => item.id}
      renderItem={renderImpact}

        ListEmptyComponent={renderEmpty}

       ListHeaderComponent={
  <>
    <View style={styles.heroCard}>

      <View style={styles.heroTop}>

        <View style={styles.heroIconCircle}>
          <Ionicons
            name="leaf-outline"
            size={28}
            color="#5F7D68"
          />
        </View>

        <View style={styles.heroTextContainer}>

          <Text style={styles.heroEyebrow}>
            MAKE A DIFFERENCE
          </Text>

          <Text style={styles.heroTitle}>
            Together for a{"\n"}
            Better Tomorrow
          </Text>

          <Text style={styles.heroSubtitle}>
            Small actions create big changes.
            Be the reason someone smiles today.
          </Text>

        </View>

      </View>

      <TouchableOpacity
        style={styles.heroButton}
        onPress={() =>
          navigation.navigate("CreateImpact")
        }
        activeOpacity={0.85}
      >
        <Text style={styles.heroButtonText}>
          Create Impact
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color="#FFFFFF"
        />
      
      </TouchableOpacity>

    </View>

    {/* IMPACT STATISTICS */}
    <View style={styles.impactStatsCard}>
      <View style={styles.impactStat}>
        <Ionicons name="people-outline" size={21} color="#5F7D68" />
        <Text style={styles.impactStatNumber}>{totalPeopleHelped}</Text>
        <Text style={styles.impactStatLabel}>People Helped</Text>
      </View>

      <View style={styles.impactStatDivider} />

      <View style={styles.impactStat}>
        <Ionicons name="heart-outline" size={21} color="#E83263" />
        <Text style={styles.impactStatNumber}>{totalActions}</Text>
        <Text style={styles.impactStatLabel}>Positive Actions</Text>
      </View>

      <View style={styles.impactStatDivider} />

      <View style={styles.impactStat}>
        <Ionicons name="location-outline" size={21} color="#A17B4A" />
        <Text style={styles.impactStatNumber}>{totalCities}</Text>
        <Text style={styles.impactStatLabel}>Locations</Text>
      </View>
    </View>

    


     {/* ================= CREATE ACTIONS ================= */}

     <View style={styles.createActions}>

  {/* CREATE IMPACT */}

  <TouchableOpacity
    style={[
      styles.createActionCard,
      styles.impactActionCard,
    ]}
    onPress={() =>
      navigation.navigate("CreateImpact")
    }
    activeOpacity={0.85}
  >

    <View style={styles.createActionIconImpact}>
      <Ionicons
        name="heart"
        size={22}
        color="#E83263"
      />
    </View>

    <View style={styles.createActionContent}>
      <Text style={styles.createActionTitle}>
        Create an Impact
      </Text>

      <Text style={styles.createActionSubtitle}>
        Share a good action you did today.
      </Text>
    </View>

    <Ionicons
      name="chevron-forward"
      size={21}
      color="#B5AAA2"
    />

  </TouchableOpacity>


  {/* CREATE INITIATIVE */}

  <TouchableOpacity
    style={[
      styles.createActionCard,
      styles.initiativeActionCard,
    ]}
    onPress={() =>
      navigation.navigate("CreateInitiative")
    }
    activeOpacity={0.85}
  >

    <View style={styles.createActionIconInitiative}>
      <Ionicons
        name="leaf"
        size={23}
        color="#53745C"
      />
    </View>

    <View style={styles.createActionContent}>
      <Text style={styles.createActionTitle}>
        Start an Initiative
      </Text>

      <Text style={styles.createActionSubtitle}>
        Turn an idea into meaningful change.
      </Text>
    </View>

    <Ionicons
      name="chevron-forward"
      size={21}
      color="#9AA39B"
    />

  </TouchableOpacity>

</View>

{/* ================= IMPACT CATEGORY FILTERS ================= */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.categoryFiltersContainer}
>
  {[
    "All",
    "Helping Others",
    "Environment",
    "Education",
    "Blood Donation",
  ].map((category) => {
    const isSelected = selectedCategory === category;

    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryFilterChip,
          isSelected && styles.categoryFilterChipActive,
        ]}
        onPress={() => setSelectedCategory(category)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.categoryFilterText,
            isSelected && styles.categoryFilterTextActive,
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>


  </>
  }

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

  headerLeft: {
  flex: 1,
},

headerActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

searchButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F8F6F0",
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

    // ================= HERO =================

  heroCard: {
    marginHorizontal: 15,
    marginTop: 14,
    marginBottom: 16,
    padding: 20,
    borderRadius: 26,
    backgroundColor: "#FFF8F2",
    borderWidth: 1,
    borderColor: "#EEDFD2",
    overflow: "hidden",
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  heroIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EAF2EA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  heroTextContainer: {
    flex: 1,
  },

  heroEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#A17B4A",
    marginBottom: 7,
  },

  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    color: "#2C241F",
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#756B63",
    marginTop: 8,
  },

  heroButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E83263",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    elevation: 2,
  },

  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginRight: 8,
  },

  // ================= LIST =================

  listContent: {
    paddingTop: 10,
    paddingBottom: 110,
  },


  // ================= CARD =================

card: {
  backgroundColor: "#FFFFFF",
  marginHorizontal: 15,
  marginBottom: 16,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "#EEE6DF",
  padding: 17,
  overflow: "hidden",
  elevation: 1,
  shadowColor: "#38261C",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.04,
  shadowRadius: 8,
},


  // ================= USER =================

 
userRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 2,
},

avatar: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: "#F0ECE8",
  borderWidth: 2,
  borderColor: "#F5DCE4",
},


userInfo: {
  flex: 1,
  marginLeft: 12,
  justifyContent: "center",
},


userName: {
  fontSize: 16,
  fontWeight: "800",
  color: "#2C241F",
  letterSpacing: -0.3,
},

time: {
  fontSize: 12,
  color: "#91867D",
  marginTop: 4,
  fontWeight: "500",
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
  marginTop: 17,
  marginBottom: 2,
  backgroundColor: "#FBEAF0",
  borderRadius: 20,
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: "#F2D5E0",
},

categoryText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#B92F59",
  letterSpacing: 0.2,
},



  // ================= CONTENT =================


action: {
  fontSize: 21,
  lineHeight: 29,
  fontWeight: "800",
  color: "#29231F",
  marginTop: 12,
  letterSpacing: -0.4,
},

story: {
  fontSize: 14,
  lineHeight: 22,
  color: "#70665E",
  marginTop: 8,
  letterSpacing: 0.1,
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
  marginTop: 16,
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
  marginTop: 16,
  paddingTop: 14,
  borderTopWidth: 1,
  borderTopColor: "#F0E8E2",
},

stat: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  marginRight: 24,
},

statText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#625850",
  marginLeft: 6,
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

  // ================= CREATE ACTIONS =================

createActions: {
  paddingHorizontal: 15,
  paddingTop: 12,
  paddingBottom: 4,
},

createActionCard: {
  minHeight: 78,
  borderRadius: 20,
  paddingHorizontal: 14,
  paddingVertical: 12,
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
  borderWidth: 1,
},

impactActionCard: {
  backgroundColor: "#FFF7FA",
  borderColor: "#F5DCE4",
},

initiativeActionCard: {
  backgroundColor: "#F3F8F3",
  borderColor: "#DCE8DD",
},

createActionIconImpact: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#FCE8EE",
  alignItems: "center",
  justifyContent: "center",
},

createActionIconInitiative: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#E4EFE5",
  alignItems: "center",
  justifyContent: "center",
},

createActionContent: {
  flex: 1,
  marginLeft: 12,
  marginRight: 8,
},

createActionTitle: {
  fontSize: 15,
  fontWeight: "800",
  color: "#2C241F",
},

createActionSubtitle: {
  fontSize: 11,
  lineHeight: 16,
  color: "#817970",
  marginTop: 3,
},


impactStatsCard: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  marginHorizontal: 15,
  marginTop: 0,
  marginBottom: 16,
  paddingVertical: 17,
  paddingHorizontal: 5,
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#ECE4D9",
},

impactStat: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

impactStatNumber: {
  fontSize: 21,
  fontWeight: "800",
  color: "#2C241F",
  marginTop: 6,
},

impactStatLabel: {
  fontSize: 10,
  fontWeight: "600",
  color: "#81776F",
  textAlign: "center",
  marginTop: 4,
},


categoryFiltersContainer: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 15,
  paddingVertical: 4,
  gap: 8,
},

categoryFilterChip: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#E7DFD7",
},

categoryFilterChipActive: {
  backgroundColor: "#E83263",
  borderColor: "#E83263",
},

categoryFilterText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#756B63",
},

categoryFilterTextActive: {
  color: "#FFFFFF",
},


});