import React, { useEffect, useMemo, useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { db } from "../firebase";

import {
  collection,
  getDocs,
} from "firebase/firestore";


export default function Search({ navigation }) {

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("People");

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // LOAD SEARCH DATA
  // =====================================================

  useEffect(() => {

    const loadSearchData = async () => {

      try {

        setLoading(true);
        setError("");

        const usersSnapshot =
          await getDocs(collection(db, "users"));

        const usersData =
          usersSnapshot.docs.map((userDoc) => ({
            id: userDoc.id,
            ...userDoc.data(),
          }));


        const postsSnapshot =
          await getDocs(collection(db, "posts"));

        const postsData =
          postsSnapshot.docs.map((postDoc) => ({
            id: postDoc.id,
            ...postDoc.data(),
          }));


        setUsers(usersData);
        setPosts(postsData);

      } catch (error) {

        console.log(
          "SEARCH LOAD ERROR:",
          error
        );

        setError(
          "Unable to load search results."
        );

      } finally {

        setLoading(false);

      }
    };


    loadSearchData();

  }, []);


  // =====================================================
  // SEARCH TEXT
  // =====================================================

  const normalizedSearch =
    searchText.trim().toLowerCase();


  // =====================================================
  // FILTER PEOPLE
  // =====================================================

  const filteredUsers = useMemo(() => {

    if (!normalizedSearch) {
      return [];
    }

    return users.filter((user) => {

      const name =
        user.name?.toLowerCase() || "";

      const bio =
        user.bio?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        bio.includes(normalizedSearch)
      );

    });

  }, [users, normalizedSearch]);


  // =====================================================
  // FILTER MOMENTS
  // =====================================================

  const filteredPosts = useMemo(() => {

    if (!normalizedSearch) {
      return [];
    }

    return posts.filter((post) => {

      const caption =
        post.caption?.toLowerCase() || "";

      const userName =
        post.userName?.toLowerCase() || "";

      return (
        caption.includes(normalizedSearch) ||
        userName.includes(normalizedSearch)
      );

    });

  }, [posts, normalizedSearch]);


  // =====================================================
  // CURRENT RESULTS
  // =====================================================

  const results =
    activeTab === "People"
      ? filteredUsers
      : filteredPosts;


  // =====================================================
  // OPEN PROFILE
  // =====================================================

  const openUserProfile = (user) => {

    Keyboard.dismiss();

    navigation.navigate(
      "UserProfile",
      {
        user: user,
      }
    );

  };


  // =====================================================
  // OPEN MOMENT
  // =====================================================

  const openMoment = (post) => {

    Keyboard.dismiss();

    navigation.navigate(
      "Moments",
      {
        postId: post.id,
      }
    );

  };


  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const clearSearch = () => {

    setSearchText("");

  };


  // =====================================================
  // RESULT COUNT
  // =====================================================

  const resultCount =
    results.length;


  return (

    <SafeAreaView style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >

          <Ionicons
            name="arrow-back"
            size={25}
            color="#111111"
          />

        </TouchableOpacity>


        <View style={styles.headerTitleContainer}>

          <Text style={styles.headerTitle}>
            Search
          </Text>

          <Text style={styles.headerSubtitle}>
            Discover something new
          </Text>

        </View>


        <View style={styles.headerSpacer} />

      </View>


      {/* =================================================
          SEARCH BAR
      ================================================= */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search-outline"
          size={23}
          color="#777777"
        />


        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search people, Moments..."
          placeholderTextColor="#999999"
          style={styles.searchInput}
          autoFocus={true}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />


        {searchText.length > 0 && (

          <TouchableOpacity
            onPress={clearSearch}
            style={styles.clearButton}
          >

            <Ionicons
              name="close-circle"
              size={21}
              color="#999999"
            />

          </TouchableOpacity>

        )}

      </View>


      {/* =================================================
          SEARCH TABS
      ================================================= */}

      <View style={styles.tabsContainer}>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "People" &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab("People")
          }
        >

          <Ionicons
            name="people-outline"
            size={18}
            color={
              activeTab === "People"
                ? "#FFFFFF"
                : "#666666"
            }
          />

          <Text
            style={[
              styles.tabText,
              activeTab === "People" &&
                styles.activeTabText,
            ]}
          >
            People
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "Moments" &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab("Moments")
          }
        >

          <Ionicons
            name="images-outline"
            size={18}
            color={
              activeTab === "Moments"
                ? "#FFFFFF"
                : "#666666"
            }
          />

          <Text
            style={[
              styles.tabText,
              activeTab === "Moments" &&
                styles.activeTabText,
            ]}
          >
            Moments
          </Text>

        </TouchableOpacity>

      </View>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <View style={styles.centerState}>

          <ActivityIndicator
            size="large"
            color="#ef3b65"
          />

          <Text style={styles.loadingTitle}>
            Finding something for you...
          </Text>

          <Text style={styles.loadingText}>
            Please wait a moment.
          </Text>

        </View>

      ) : error ? (

        /* =================================================
           ERROR
        ================================================= */

        <View style={styles.centerState}>

          <View style={styles.stateCircle}>

            <Ionicons
              name="alert-circle-outline"
              size={40}
              color="#ef3b65"
            />

          </View>

          <Text style={styles.stateTitle}>
            Something went wrong
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>

        </View>

      ) : !normalizedSearch ? (

        /* =================================================
           EMPTY SEARCH
        ================================================= */

        <View style={styles.centerState}>

          <View style={styles.searchIllustration}>

            <Ionicons
              name="search-outline"
              size={46}
              color="#ef3b65"
            />

          </View>

          <Text style={styles.stateTitle}>
            What are you looking for?
          </Text>

          <Text style={styles.stateText}>
            Search for people or Moments
            {"\n"}
            and discover your community.
          </Text>

        </View>

      ) : resultCount === 0 ? (

        /* =================================================
           NO RESULTS
        ================================================= */

        <View style={styles.centerState}>

          <View style={styles.stateCircle}>

            <Text style={styles.noResultEmoji}>
              🔎
            </Text>

          </View>

          <Text style={styles.stateTitle}>
            No {activeTab.toLowerCase()} found
          </Text>

          <Text style={styles.stateText}>
            Try another search word or name.
          </Text>

        </View>

      ) : (

        /* =================================================
           RESULTS
        ================================================= */

        <FlatList

          data={results}

          keyExtractor={(item) =>
            item.id
          }

          showsVerticalScrollIndicator={false}

          keyboardShouldPersistTaps="handled"

          contentContainerStyle={
            styles.resultsContainer
          }


          ListHeaderComponent={

            <View style={styles.resultsHeader}>

              <Text style={styles.resultsTitle}>

                {resultCount}{" "}

                {activeTab === "People"
                  ? resultCount === 1
                    ? "person"
                    : "people"
                  : resultCount === 1
                  ? "Moment"
                  : "Moments"}

              </Text>

              <Text style={styles.resultsFor}>

                Results for "{searchText.trim()}"

              </Text>

            </View>

          }


          renderItem={({ item }) => {

            // ==========================================
            // PEOPLE
            // ==========================================

            if (activeTab === "People") {

              return (

                <TouchableOpacity
                  style={styles.userCard}
                  activeOpacity={0.75}
                  onPress={() =>
                    openUserProfile(item)
                  }
                >

                  <Image
                    source={
                      item.photoURL
                        ? {
                            uri:
                              item.photoURL,
                          }
                        : require(
                            "../assets/icon.png"
                          )
                    }
                    style={styles.userAvatar}
                  />


                  <View
                    style={
                      styles.resultContent
                    }
                  >

                    <Text
                      style={
                        styles.userName
                      }
                      numberOfLines={1}
                    >
                      {item.name ||
                        "Unknown User"}
                    </Text>


                    <Text
                      style={
                        styles.userBio
                      }
                      numberOfLines={2}
                    >
                      {item.bio ||
                        "Moments member"}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.resultArrow
                    }
                  >

                    <Ionicons
                      name="chevron-forward"
                      size={21}
                      color="#999999"
                    />

                  </View>

                </TouchableOpacity>

              );

            }


            // ==========================================
            // MOMENTS
            // ==========================================

            return (

              <TouchableOpacity
                style={styles.momentCard}
                activeOpacity={0.75}
                onPress={() =>
                  openMoment(item)
                }
              >

                {item.imageUrl ? (

                  <Image
                    source={{
                      uri:
                        item.imageUrl,
                    }}
                    style={
                      styles.momentImage
                    }
                  />

                ) : (

                  <View
                    style={
                      styles.momentPlaceholder
                    }
                  >

                    <Ionicons
                      name="heart-outline"
                      size={28}
                      color="#ef3b65"
                    />

                  </View>

                )}


                <View
                  style={
                    styles.momentContent
                  }
                >

                  <Text
                    style={
                      styles.momentUser
                    }
                    numberOfLines={1}
                  >
                    {item.userName ||
                      "Someone"}
                  </Text>


                  <Text
                    style={
                      styles.momentCaption
                    }
                    numberOfLines={3}
                  >
                    {item.caption ||
                      "A shared Moment"}
                  </Text>


                  <View
                    style={
                      styles.momentMeta
                    }
                  >

                    <Ionicons
                      name="heart-outline"
                      size={14}
                      color="#888888"
                    />

                    <Text
                      style={
                        styles.momentMetaText
                      }
                    >
                      {item.likes || 0}
                    </Text>

                    <Ionicons
                      name="chatbubble-outline"
                      size={14}
                      color="#888888"
                      style={{
                        marginLeft: 9,
                      }}
                    />

                    <Text
                      style={
                        styles.momentMetaText
                      }
                    >
                      {item.comments || 0}
                    </Text>

                  </View>

                </View>


                <View
                  style={
                    styles.resultArrow
                  }
                >

                  <Ionicons
                    name="chevron-forward"
                    size={21}
                    color="#999999"
                  />

                </View>

              </TouchableOpacity>

            );

          }}

        />

      )}

    </SafeAreaView>

  );

}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },


  // ===================================================
  // HEADER
  // ===================================================

  header: {
    height: 72,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },


  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },


  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },


  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
  },


  headerSubtitle: {
    fontSize: 11,
    color: "#888888",
    marginTop: 2,
  },


  headerSpacer: {
    width: 42,
  },


  // ===================================================
  // SEARCH BAR
  // ===================================================

  searchContainer: {
    height: 54,
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },


  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111111",
    marginLeft: 10,
    paddingVertical: 0,
  },


  clearButton: {
    padding: 3,
  },


  // ===================================================
  // TABS
  // ===================================================

  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 5,
    backgroundColor: "#eeeeef",
    borderRadius: 15,
    padding: 3,
  },


  tab: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },


  activeTab: {
    backgroundColor: "#ef3b65",
  },


  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666666",
    marginLeft: 6,
  },


  activeTabText: {
    color: "#ffffff",
  },


  // ===================================================
  // RESULTS
  // ===================================================

  resultsContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },


  resultsHeader: {
    marginBottom: 10,
  },


  resultsTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222222",
  },


  resultsFor: {
    fontSize: 12,
    color: "#888888",
    marginTop: 3,
  },


  // ===================================================
  // USER CARD
  // ===================================================

  userCard: {
    minHeight: 76,
    backgroundColor: "#ffffff",
    borderRadius: 17,
    marginBottom: 10,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eeeeee",
  },


  userAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#eeeeee",
  },


  resultContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },


  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
  },


  userBio: {
    fontSize: 12,
    lineHeight: 17,
    color: "#777777",
    marginTop: 4,
  },


  resultArrow: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },


  // ===================================================
  // MOMENT CARD
  // ===================================================

  momentCard: {
    minHeight: 90,
    backgroundColor: "#ffffff",
    borderRadius: 17,
    marginBottom: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eeeeee",
  },


  momentImage: {
    width: 70,
    height: 70,
    borderRadius: 13,
  },


  momentPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 13,
    backgroundColor: "#fff0f4",
    alignItems: "center",
    justifyContent: "center",
  },


  momentContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 5,
  },


  momentUser: {
    fontSize: 13,
    fontWeight: "800",
    color: "#333333",
  },


  momentCaption: {
    fontSize: 13,
    lineHeight: 18,
    color: "#555555",
    marginTop: 3,
  },


  momentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },


  momentMetaText: {
    fontSize: 11,
    color: "#888888",
    marginLeft: 3,
  },


  // ===================================================
  // CENTER STATES
  // ===================================================

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 100,
  },


  searchIllustration: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#fff0f4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },


  stateCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#fff0f4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },


  noResultEmoji: {
    fontSize: 34,
  },


  stateTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222222",
    textAlign: "center",
  },


  stateText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#777777",
    textAlign: "center",
    marginTop: 7,
  },


  loadingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginTop: 14,
  },


  loadingText: {
    fontSize: 13,
    color: "#888888",
    marginTop: 5,
  },

});