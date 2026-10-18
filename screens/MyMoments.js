import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Share,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { auth, db } from "../firebase";

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const { width, height } = Dimensions.get("window");

const COLORS = {
  navy: "#151D31",
  navyLight: "#202B43",
  gold: "#D7B56D",
  goldSoft: "#B99A5C",
  ivory: "#F4EAD2",
  white: "#FFFFFF",
  textSoft: "#B5BDCC",
  textMuted: "#7F899D",
  pink: "#E83263",
};

const MyMoments = ({ route, navigation }) => {
  const { moments = [], selectedIndex = 0 } = route.params || {};

  const [localMoments, setLocalMoments] = useState(moments);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState(null);

  useFocusEffect(
  useCallback(() => {
    const refreshMoments = async () => {
      try {
        const refreshedMoments = await Promise.all(
          localMoments.map(async (item) => {
            if (!item.id) return item;

            const postSnap = await getDoc(
              doc(db, "posts", item.id)
            );

            if (!postSnap.exists()) {
              return item;
            }

            return {
              ...item,
              ...postSnap.data(),
              id: postSnap.id,
            };
          })
        );

        setLocalMoments(refreshedMoments);
      } catch (error) {
        console.log(
          "MY MOMENTS REFRESH ERROR:",
          error
        );
      }
    };

    refreshMoments();
  }, [])
);

  const handleLike = async (momentId) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first!");
      return;
    }

    const moment = localMoments.find(
      (item) => item.id === momentId
    );

    if (!moment) return;

    const likedBy = moment.likedBy || [];
    const alreadyLiked = likedBy.includes(currentUser.uid);

    const momentRef = doc(db, "posts", momentId);

    // Update screen immediately
    setLocalMoments((current) =>
      current.map((item) => {
        if (item.id !== momentId) return item;

        return {
          ...item,

          likes: Math.max(
            0,
            (item.likes || 0) + (alreadyLiked ? -1 : 1)
          ),

          likedBy: alreadyLiked
            ? (item.likedBy || []).filter(
                (uid) => uid !== currentUser.uid
              )
            : [...(item.likedBy || []), currentUser.uid],
        };
      })
    );

    // Update Firestore
    if (alreadyLiked) {
      await updateDoc(momentRef, {
        likes: increment(-1),
        likedBy: arrayRemove(currentUser.uid),
      });
    } else {
      await updateDoc(momentRef, {
        likes: increment(1),
        likedBy: arrayUnion(currentUser.uid),
      });
    }
  } catch (error) {
    console.log("MY MOMENT LIKE ERROR:", error);
  }
};

const handleSave = async (momentId) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first!");
      return;
    }

    const moment = localMoments.find(
      (item) => item.id === momentId
    );

    if (!moment) return;

    const savedBy = moment.savedBy || [];
    const alreadySaved = savedBy.includes(currentUser.uid);

    const momentRef = doc(db, "posts", momentId);

    // Update UI immediately
    setLocalMoments((current) =>
      current.map((item) => {
        if (item.id !== momentId) return item;

        return {
          ...item,

          savedBy: alreadySaved
            ? (item.savedBy || []).filter(
                (uid) => uid !== currentUser.uid
              )
            : [...(item.savedBy || []), currentUser.uid],
        };
      })
    );

    // Update Firestore
    if (alreadySaved) {
      await updateDoc(momentRef, {
        savedBy: arrayRemove(currentUser.uid),
      });
    } else {
      await updateDoc(momentRef, {
        savedBy: arrayUnion(currentUser.uid),
      });
    }
  } catch (error) {
    console.log("MY MOMENT SAVE ERROR:", error);
  }
};

const handleShare = async (item) => {
  try {
    const message =
      `✨ ${item.caption || "A Moment to Remember"}\n\n` +
      `Shared from Moments ❤️`;

    await Share.share({
      message,
      ...(item.imageUrl ? { url: item.imageUrl } : {}),
    });
  } catch (error) {
    console.log("MY MOMENT SHARE ERROR:", error);
  }
};

const handleDelete = async (item) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first.");
      return;
    }

    // Safety: only the owner can delete
    if (item.userId !== currentUser.uid) {
      Alert.alert(
        "Not Allowed",
        "You can only delete your own Moment."
      );
      return;
    }

    await deleteDoc(
      doc(db, "posts", item.id)
    );

    // Remove immediately from My Moments screen
    setLocalMoments((current) =>
      current.filter(
        (moment) => moment.id !== item.id
      )
    );

    Alert.alert(
      "Moment Deleted",
      "Your Moment has been deleted successfully."
    );
  } catch (error) {
    console.log(
      "MY MOMENT DELETE ERROR:",
      error
    );

    Alert.alert(
      "Delete Failed",
      "Something went wrong while deleting your Moment."
    );
  }
};

const handleMoreOptions = (item) => {
  setSelectedMoment(item);
  setMenuVisible(true);
};

const closeMomentMenu = () => {
  setMenuVisible(false);
  setSelectedMoment(null);
};

  const renderMoment = ({ item, index }) => {
    const isLast = index === localMoments.length - 1;

    return (
      <View style={styles.page}>
        {/* ================= HEADER ================= */}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={COLORS.ivory}
            />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>MY MOMENTS</Text>

            <View style={styles.subtitleRow}>
              <View style={styles.smallGoldLine} />

              <Text style={styles.topSubtitle}>
                YOUR PRIVATE COLLECTION
              </Text>

              <View style={styles.smallGoldLine} />
            </View>
          </View>

          <View style={styles.numberBox}>
            <Text style={styles.numberText}>
              {String(index + 1).padStart(2, "0")}
            </Text>

            <Text style={styles.numberTotal}>
              /{String(localMoments.length).padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* ================= HERO ================= */}

        <View style={styles.heroArea}>
          <View style={styles.outerFrame}>
            {/* Decorative corners */}

            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            <View style={styles.innerFrame}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.noImage}>
                  <View style={styles.noImageCircle}>
                    <Ionicons
                      name="images-outline"
                      size={38}
                      color={COLORS.gold}
                    />
                  </View>

                  <Text style={styles.noImageText}>
                    No photograph added
                  </Text>
                </View>
              )}

              {/* Number badge */}

              <View style={styles.floatingNumber}>
                <Text style={styles.floatingNumberText}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>

              {/* MORE OPTIONS */}
<TouchableOpacity
  style={styles.moreButton}
  activeOpacity={0.75}
  onPress={() => handleMoreOptions(item)}
>
  <Ionicons
    name="ellipsis-vertical"
    size={20}
    color={COLORS.ivory}
  />
</TouchableOpacity>

            </View>
          </View>
        </View>

        {/* ================= MEMORY ================= */}

        <View style={styles.memorySection}>
          {/* Classic divider */}

          <View style={styles.classicDivider}>
            <View style={styles.dividerLine} />

            <View style={styles.diamond} />

            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.memoryLabel}>
            A MOMENT TO REMEMBER
          </Text>

          <View style={styles.memoryHeadingRow}>
            <View style={styles.memoryTextArea}>
              <Text style={styles.memoryTitle}>
                My Memory
              </Text>

              {item.caption ? (
                <Text
                  style={styles.caption}
                  numberOfLines={2}
                >
                  {item.caption}
                </Text>
              ) : (
                <Text
                  style={styles.noCaption}
                  numberOfLines={2}
                >
                  A beautiful moment from your journey.
                </Text>
              )}
            </View>

           <View style={styles.memoryActions}>

  {/* LIKE */}
  <TouchableOpacity
    style={styles.heartOuter}
    activeOpacity={0.75}
    onPress={() => handleLike(item.id)}
  >
    <View style={styles.heartCircle}>
      <Ionicons
        name={
          item.likedBy?.includes(auth.currentUser?.uid)
            ? "heart"
            : "heart-outline"
        }
        size={20}
        color={
          item.likedBy?.includes(auth.currentUser?.uid)
            ? COLORS.pink
            : COLORS.goldSoft
        }
      />
    </View>
  </TouchableOpacity>

  {/* COMMENT */}
  <TouchableOpacity
    style={styles.commentOuter}
    activeOpacity={0.75}
    onPress={() =>
      navigation.navigate("Comment", {
        postId: item.id,
      })
    }
  >
    <View style={styles.commentCircle}>
      <Ionicons
        name="chatbubble-outline"
        size={19}
        color={COLORS.goldSoft}
      />
    </View>
  </TouchableOpacity>

  {/* SAVE */}
  <TouchableOpacity
    style={styles.saveOuter}
    activeOpacity={0.75}
    onPress={() => handleSave(item.id)}
  >
    <View style={styles.saveCircle}>
      <Ionicons
        name={
          item.savedBy?.includes(auth.currentUser?.uid)
            ? "bookmark"
            : "bookmark-outline"
        }
        size={19}
        color={
          item.savedBy?.includes(auth.currentUser?.uid)
            ? COLORS.gold
            : COLORS.goldSoft
        }
      />
    </View>
  </TouchableOpacity>

</View>


          </View>
        </View>

        

        {/* ================= PAGE INDICATOR ================= */}

        <View style={styles.paginationArea}>
          <View style={styles.pagination}>
            {localMoments.map((_, dotIndex) => {
              const active = dotIndex === index;

              return (
                <View
                  key={dotIndex}
                  style={[
                    styles.dot,
                    active && styles.activeDot,
                  ]}
                >
                  {active && (
                    <View style={styles.activeDotInner} />
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.swipeText}>
            SWIPE TO EXPLORE
          </Text>
        </View>

        {/* Last moment */}

        {isLast && (
          <View style={styles.endTextContainer}>
            <View style={styles.endLine} />

            <Ionicons
              name="sparkles-outline"
              size={12}
              color={COLORS.goldSoft}
            />

            <Text style={styles.endText}>
              END OF YOUR MOMENTS
            </Text>

            <Ionicons
              name="sparkles-outline"
              size={12}
              color={COLORS.goldSoft}
            />

            <View style={styles.endLine} />
          </View>
        )}
      </View>
    );
  };

  /* ================= EMPTY ================= */

  if (localMoments.length === 0) {
    return (
      <SafeAreaView
        style={styles.emptyScreen}
        edges={["top", "bottom"]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.navy}
        />

        <View style={styles.emptyHeader}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={COLORS.ivory}
            />
          </TouchableOpacity>

          <View style={styles.emptyHeaderCenter}>
            <Text style={styles.emptyHeaderTitle}>
              MY MOMENTS
            </Text>

            <Text style={styles.emptyHeaderSubtitle}>
              YOUR PRIVATE COLLECTION
            </Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.emptyContent}>
          <View style={styles.emptyOuterCircle}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="images-outline"
                size={39}
                color={COLORS.gold}
              />
            </View>
          </View>

          <View style={styles.emptyDivider}>
            <View style={styles.emptyDividerLine} />
            <View style={styles.diamond} />
            <View style={styles.emptyDividerLine} />
          </View>

          <Text style={styles.emptyTitle}>
            Your story starts here
          </Text>

          <Text style={styles.emptySubtitle}>
            Create your first Moment and preserve{"\n"}
            the memories that matter to you.
          </Text>

          <TouchableOpacity
            style={styles.goBackButton}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={COLORS.navy}
            />

            <Text style={styles.goBackText}>
              RETURN
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= MAIN ================= */

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.navy}
      />

      <FlatList
        data={localMoments}
        keyExtractor={(item, index) =>
          item.id
            ? item.id.toString()
            : index.toString()
        }
        renderItem={renderMoment}
        initialScrollIndex={
          selectedIndex >= 0 &&
          selectedIndex < moments.length
            ? selectedIndex
            : 0
        }
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
      />
      {/* ================= ROYAL MOMENT MENU ================= */}

<Modal
  visible={menuVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={closeMomentMenu}
>
  <Pressable
    style={styles.menuOverlay}
    onPress={closeMomentMenu}
  >
    <Pressable
      style={styles.royalMenu}
      onPress={(event) => event.stopPropagation()}
    >
      {/* CLOSE */}
      <TouchableOpacity
        style={styles.menuCloseButton}
        activeOpacity={0.75}
        onPress={closeMomentMenu}
      >
        <Ionicons
          name="close"
          size={20}
          color={COLORS.ivory}
        />
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.royalMenuHeader}>
        <Text style={styles.royalMenuTitle}>
          MOMENT OPTIONS
        </Text>

        <View style={styles.royalMenuDivider}>
          <View style={styles.royalMenuLine} />
          <View style={styles.royalMenuDiamond} />
          <View style={styles.royalMenuLine} />
        </View>

        <Text style={styles.royalMenuSubtitle}>
          YOUR MEMORY • YOUR CHOICE
        </Text>
      </View>

      {/* EDIT */}
      <TouchableOpacity
        style={styles.royalMenuItem}
        activeOpacity={0.75}
        onPress={() => {
          const item = selectedMoment;

          closeMomentMenu();

          if (!item) return;

          navigation.navigate("EditMoment", {
            postId: item.id,
          });
        }}
      >
        <View style={styles.royalMenuIcon}>
          <Ionicons
            name="create-outline"
            size={20}
            color={COLORS.gold}
          />
        </View>

        <View style={styles.royalMenuTextArea}>
          <Text style={styles.royalMenuItemTitle}>
            Edit Moment
          </Text>

          <Text style={styles.royalMenuItemSubtitle}>
            Update your memory
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.goldSoft}
        />
      </TouchableOpacity>

      {/* SHARE */}
      <TouchableOpacity
        style={styles.royalMenuItem}
        activeOpacity={0.75}
        onPress={() => {
          const item = selectedMoment;

          closeMomentMenu();

          if (item) {
            handleShare(item);
          }
        }}
      >
        <View style={styles.royalMenuIcon}>
          <Ionicons
            name="paper-plane-outline"
            size={19}
            color={COLORS.gold}
          />
        </View>

        <View style={styles.royalMenuTextArea}>
          <Text style={styles.royalMenuItemTitle}>
            Share Moment
          </Text>

          <Text style={styles.royalMenuItemSubtitle}>
            Share this memory
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.goldSoft}
        />
      </TouchableOpacity>

      {/* DELETE */}
      <TouchableOpacity
        style={[
          styles.royalMenuItem,
          styles.deleteMenuItem,
        ]}
        activeOpacity={0.75}
        onPress={() => {
          const item = selectedMoment;

          closeMomentMenu();

          if (!item) return;

          Alert.alert(
            "Delete Moment",
            "Are you sure you want to permanently delete this Moment?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => handleDelete(item),
              },
            ]
          );
        }}
      >
        <View
          style={[
            styles.royalMenuIcon,
            styles.deleteMenuIcon,
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={19}
            color="#E96A72"
          />
        </View>

        <View style={styles.royalMenuTextArea}>
          <Text style={styles.deleteMenuTitle}>
            Delete Moment
          </Text>

          <Text style={styles.royalMenuItemSubtitle}>
            Permanently remove this memory
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#B85B64"
        />
      </TouchableOpacity>

      {/* CANCEL */}
      <TouchableOpacity
        style={styles.royalCancelButton}
        activeOpacity={0.8}
        onPress={closeMomentMenu}
      >
        <Ionicons
          name="arrow-back"
          size={17}
          color={COLORS.navy}
        />

        <Text style={styles.royalCancelText}>
          RETURN TO MOMENT
        </Text>
      </TouchableOpacity>
    </Pressable>
  </Pressable>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /* ================= SCREEN ================= */

  screen: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },

  page: {
    width,
    height,

    backgroundColor: COLORS.navy,

    paddingHorizontal: 19,
    paddingTop: 8,
    paddingBottom: 8,
  },

  /* ================= HEADER ================= */

  topBar: {
    height: 70,

    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: "rgba(255,255,255,0.055)",

    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.32)",

    alignItems: "center",
    justifyContent: "center",
  },

  topCenter: {
    flex: 1,

    alignItems: "center",

    paddingHorizontal: 8,
  },

  topTitle: {
    color: COLORS.ivory,

    fontSize: 15.5,
    fontWeight: "900",

    letterSpacing: 2.1,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 5,
  },

  smallGoldLine: {
    width: 12,
    height: 1,

    backgroundColor: COLORS.goldSoft,

    opacity: 0.65,

    marginHorizontal: 6,
  },

  topSubtitle: {
    color: COLORS.goldSoft,

    fontSize: 7.5,
    fontWeight: "800",

    letterSpacing: 1.15,
  },

  numberBox: {
    width: 44,

    flexDirection: "row",
    alignItems: "baseline",

    justifyContent: "flex-end",
  },

  numberText: {
    color: COLORS.ivory,

    fontSize: 19,
    fontWeight: "800",
  },

  numberTotal: {
    color: COLORS.goldSoft,

    fontSize: 9,
    fontWeight: "700",

    marginLeft: 1,
  },

  /* ================= HERO ================= */

 heroArea: {
  justifyContent: "flex-start",
  paddingTop: 28,
  paddingBottom: 0,
},

  outerFrame: {
    width: "100%",
    height: height * 0.52,

    borderRadius: 28,

    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.48)",

    padding: 5,

    backgroundColor: "#1B253B",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 13,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,

    elevation: 12,
  },

  innerFrame: {
    flex: 1,

    borderRadius: 22,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(244,234,210,0.12)",

    backgroundColor: COLORS.navyLight,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  /* Classic corner decorations */

  corner: {
    position: "absolute",

    width: 17,
    height: 17,

    zIndex: 10,
  },

  cornerTopLeft: {
    top: -4,
    left: -4,

    borderTopWidth: 2,
    borderLeftWidth: 2,

    borderColor: COLORS.gold,

    borderTopLeftRadius: 8,
  },

  cornerTopRight: {
    top: -4,
    right: -4,

    borderTopWidth: 2,
    borderRightWidth: 2,

    borderColor: COLORS.gold,

    borderTopRightRadius: 8,
  },

  cornerBottomLeft: {
    bottom: -4,
    left: -4,

    borderBottomWidth: 2,
    borderLeftWidth: 2,

    borderColor: COLORS.gold,

    borderBottomLeftRadius: 8,
  },

  cornerBottomRight: {
    bottom: -4,
    right: -4,

    borderBottomWidth: 2,
    borderRightWidth: 2,

    borderColor: COLORS.gold,

    borderBottomRightRadius: 8,
  },

  floatingNumber: {
    position: "absolute",

    top: 14,
    right: 14,

    width: 43,
    height: 43,

    borderRadius: 22,

    backgroundColor: "rgba(21,29,49,0.86)",

    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.72)",

    alignItems: "center",
    justifyContent: "center",
  },

  floatingNumberText: {
    color: COLORS.ivory,

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: 0.7,
  },

  photoPlate: {
    position: "absolute",

    bottom: 12,

    alignSelf: "center",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,
    height: 27,

    borderRadius: 14,

    backgroundColor: "rgba(21,29,49,0.80)",

    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.42)",
  },

  photoPlateText: {
    color: COLORS.ivory,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 2,

    marginHorizontal: 7,
  },

  photoPlateDot: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: COLORS.gold,
  },

  /* ================= MEMORY ================= */

  memorySection: {
    paddingTop: 22,
    paddingHorizontal: 8,
  },

  classicDivider: {
    flexDirection: "row",
    alignItems: "center",

    width: 82,

    marginBottom: 8,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor: COLORS.goldSoft,

    opacity: 0.65,
  },

  diamond: {
    width: 7,
    height: 7,

    backgroundColor: COLORS.gold,

    transform: [{ rotate: "45deg" }],

    marginHorizontal: 7,
  },

  memoryLabel: {
    color: COLORS.goldSoft,

    fontSize: 8.5,
    fontWeight: "900",

    letterSpacing: 1.55,
  },

  memoryHeadingRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 7,
  },

  memoryTextArea: {
    flex: 1,

    paddingRight: 14,
  },

  memoryTitle: {
    color: COLORS.ivory,

    fontSize: 22,
    fontWeight: "800",

    letterSpacing: 0.2,
  },

  caption: {
    color: "#D7DCE5",

    fontSize: 14,
    lineHeight: 21,

    fontWeight: "400",

    marginTop: 6,
  },

  noCaption: {
    color: COLORS.textMuted,

    fontSize: 13,

    lineHeight: 19,

    fontStyle: "italic",

    marginTop: 5,
  },

  heartOuter: {
    width: 42,
    height: 42,

    borderRadius: 21,

    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.28)",

    padding: 3,
  },

  heartCircle: {
    flex: 1,

    borderRadius: 18,

    backgroundColor: "rgba(232,50,99,0.10)",

    alignItems: "center",
    justifyContent: "center",
  },

  memoryActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

commentOuter: {
  width: 42,
  height: 42,

  borderRadius: 21,

  borderWidth: 1,
  borderColor: "rgba(215,181,109,0.28)",

  padding: 3,
},

commentCircle: {
  flex: 1,

  borderRadius: 18,

  backgroundColor: "rgba(215,181,109,0.07)",

  alignItems: "center",
  justifyContent: "center",
},

saveOuter: {
  width: 42,
  height: 42,

  borderRadius: 21,

  borderWidth: 1,
  borderColor: "rgba(215,181,109,0.28)",

  padding: 3,
},

saveCircle: {
  flex: 1,

  borderRadius: 18,

  backgroundColor: "rgba(215,181,109,0.07)",

  alignItems: "center",
  justifyContent: "center",
},

  /* ================= PAGINATION ================= */

  paginationArea: {
    alignItems: "center",

    marginTop: 13,

    minHeight: 42,
  },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    height: 15,
  },

  dot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#4E586D",

    marginHorizontal: 4,

    alignItems: "center",
    justifyContent: "center",
  },

  activeDot: {
    width: 24,
    height: 7,

    borderRadius: 4,

    backgroundColor: "rgba(215,181,109,0.20)",

    borderWidth: 1,
    borderColor: COLORS.goldSoft,
  },

  activeDotInner: {
    width: 14,
    height: 2,

    borderRadius: 2,

    backgroundColor: COLORS.gold,
  },

  swipeText: {
    color: "#737D90",

    fontSize: 7,

    fontWeight: "800",

    letterSpacing: 1.5,

    marginTop: 3,
  },

  endTextContainer: {
    position: "absolute",

    bottom: 5,
    left: 20,
    right: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  endLine: {
    width: 18,
    height: 1,

    backgroundColor: "#5D6678",

    marginHorizontal: 7,
  },

  endText: {
    color: "#747E91",

    fontSize: 7.5,
    fontWeight: "800",

    letterSpacing: 1,
  },

  /* ================= NO IMAGE ================= */

  noImage: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.navyLight,
  },

  noImageCircle: {
    width: 74,
    height: 74,

    borderRadius: 37,

    backgroundColor: "rgba(215,181,109,0.08)",

    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.30)",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 12,
  },

  noImageText: {
    color: COLORS.textMuted,

    fontSize: 12.5,

    letterSpacing: 0.4,
  },

  /* ================= EMPTY ================= */

  emptyScreen: {
    flex: 1,

    backgroundColor: COLORS.navy,
  },

  emptyHeader: {
    height: 70,

    paddingHorizontal: 19,

    flexDirection: "row",
    alignItems: "center",
  },

  emptyHeaderCenter: {
    flex: 1,

    alignItems: "center",
  },

  emptyHeaderTitle: {
    color: COLORS.ivory,

    fontSize: 15.5,
    fontWeight: "900",

    letterSpacing: 2,
  },

  emptyHeaderSubtitle: {
    color: COLORS.goldSoft,

    fontSize: 7,

    fontWeight: "800",

    letterSpacing: 1.2,

    marginTop: 4,
  },

  headerPlaceholder: {
    width: 44,
  },

  emptyContent: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,
    paddingBottom: 70,
  },

  emptyOuterCircle: {
    width: 108,
    height: 108,

    borderRadius: 54,

    borderWidth: 1,
    borderColor: "rgba(215,181,109,0.35)",

    padding: 7,

    marginBottom: 23,
  },

  emptyIcon: {
    flex: 1,

    borderRadius: 48,

    backgroundColor: "rgba(215,181,109,0.08)",

    alignItems: "center",
    justifyContent: "center",
  },

  emptyDivider: {
    width: 95,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 18,
  },

  emptyDividerLine: {
    flex: 1,

    height: 1,

    backgroundColor: COLORS.goldSoft,

    opacity: 0.55,
  },

  emptyTitle: {
    color: COLORS.ivory,

    fontSize: 23,
    fontWeight: "800",
  },

  emptySubtitle: {
    color: COLORS.textSoft,

    fontSize: 13.5,
    lineHeight: 21,

    textAlign: "center",

    marginTop: 10,
  },

  goBackButton: {
    marginTop: 27,

    height: 45,

    paddingHorizontal: 24,

    borderRadius: 23,

    backgroundColor: COLORS.gold,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  goBackText: {
    color: COLORS.navy,

    fontSize: 11,
    fontWeight: "900",

    letterSpacing: 1.3,
  },

  moreButton: {
  position: "absolute",
  top: 18,
  left: 18,

  width: 38,
  height: 38,
  borderRadius: 19,

  backgroundColor: "rgba(20, 30, 50, 0.78)",

  borderWidth: 1,
  borderColor: "rgba(215,181,109,0.55)",

  alignItems: "center",
  justifyContent: "center",

  zIndex: 10,
},

menuOverlay: {
  flex: 1,
  backgroundColor: "rgba(4, 8, 17, 0.76)",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 28,
},

royalMenu: {
  width: "100%",
  maxWidth: 390,

  backgroundColor: "#182238",

  borderRadius: 28,

  borderWidth: 1,
  borderColor: "rgba(215,181,109,0.55)",

  paddingTop: 30,
  paddingHorizontal: 20,
  paddingBottom: 20,

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 16,
  },
  shadowOpacity: 0.5,
  shadowRadius: 24,

  elevation: 24,
},

menuCloseButton: {
  position: "absolute",
  top: 15,
  right: 15,

  width: 36,
  height: 36,

  borderRadius: 18,

  backgroundColor: "rgba(255,255,255,0.05)",

  borderWidth: 1,
  borderColor: "rgba(215,181,109,0.25)",

  alignItems: "center",
  justifyContent: "center",

  zIndex: 10,
},

royalMenuHeader: {
  alignItems: "center",
  paddingBottom: 21,
},

royalMenuTitle: {
  color: COLORS.ivory,

  fontSize: 18,
  fontWeight: "900",

  letterSpacing: 2,
},

royalMenuDivider: {
  flexDirection: "row",
  alignItems: "center",

  marginTop: 11,
},

royalMenuLine: {
  width: 34,
  height: 1,

  backgroundColor: COLORS.goldSoft,

  opacity: 0.6,
},

royalMenuDiamond: {
  width: 7,
  height: 7,

  marginHorizontal: 9,

  backgroundColor: COLORS.gold,

  transform: [{ rotate: "45deg" }],
},

royalMenuSubtitle: {
  marginTop: 10,

  color: COLORS.goldSoft,

  fontSize: 8,
  fontWeight: "800",

  letterSpacing: 1.5,
},

royalMenuItem: {
  minHeight: 68,

  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 12,

  borderTopWidth: 1,
  borderTopColor: "rgba(215,181,109,0.12)",
},

royalMenuIcon: {
  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: "rgba(215,181,109,0.08)",

  borderWidth: 1,
  borderColor: "rgba(215,181,109,0.25)",

  alignItems: "center",
  justifyContent: "center",

  marginRight: 13,
},

royalMenuTextArea: {
  flex: 1,
},

royalMenuItemTitle: {
  color: COLORS.ivory,

  fontSize: 14,
  fontWeight: "800",
},

royalMenuItemSubtitle: {
  color: COLORS.textMuted,

  fontSize: 10.5,

  marginTop: 3,
},

deleteMenuItem: {
  borderBottomWidth: 0,
},

deleteMenuIcon: {
  backgroundColor: "rgba(233,106,114,0.08)",
  borderColor: "rgba(233,106,114,0.25)",
},

deleteMenuTitle: {
  color: "#E96A72",

  fontSize: 14,
  fontWeight: "800",
},

royalCancelButton: {
  height: 48,

  marginTop: 17,

  borderRadius: 24,

  backgroundColor: COLORS.gold,

  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

royalCancelText: {
  color: COLORS.navy,

  fontSize: 10.5,
  fontWeight: "900",

  letterSpacing: 1.2,

  marginLeft: 7,
},

});

export default MyMoments;