import React, { useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useScrollToTop } from "@react-navigation/native";

export default function Home({ navigation }) {
    const scrollViewRef = useRef(null);

useScrollToTop(scrollViewRef);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
  ref={scrollViewRef}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.scrollContent}
  >
    
        {/* ================= HEADER ================= */}
        <View style={styles.topHeader}>

  {/* MENU */}
  <TouchableOpacity
    style={styles.menuButton}
    activeOpacity={0.7}
  >
    <View style={styles.menuLine} />
    <View style={styles.menuLine} />
    <View style={styles.menuLine} />
  </TouchableOpacity>

  {/* LOGO */}
  <Text style={styles.logo}>
    M<Text style={styles.logoHeart}>♥️</Text>ments
  </Text>

  {/* HEADER ACTIONS */}
  <View style={styles.headerActions}>

    {/* SEARCH */}
  <TouchableOpacity
  style={styles.headerAction}
  activeOpacity={0.7}
  onPress={() => navigation.navigate("Search")}
>
  <Text style={styles.searchIcon}>⌕</Text>
</TouchableOpacity>


    {/* NOTIFICATIONS */}
    <TouchableOpacity
      style={styles.headerAction}
      activeOpacity={0.7}
    >
      <Text style={styles.notificationIcon}>♧</Text>

      <View style={styles.notificationDot} />
    </TouchableOpacity>

  </View>
</View>

        {/* ================= GREETING ================= */}
<View style={styles.greetingRow}>

  {/* PROFILE AVATAR */}
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>M</Text>
  </View>

  {/* GREETING */}
  <View style={styles.greetingText}>
    <Text style={styles.greetingTitle}>
      Good morning, Manikanta! 👋
    </Text>

    <Text style={styles.greetingSubtitle}>
      Let's make today a beautiful day.
    </Text>
  </View>

  {/* WEATHER */}
  <View style={styles.weather}>
    <Text style={styles.weatherIcon}>☀️</Text>

    <Text style={styles.temperature}>
      28°C
    </Text>

    <Text
      style={styles.location}
      numberOfLines={1}
    >
      Visakhapatnam
    </Text>
  </View>

</View>

        {/* ================= IMPACT HERO ================= */}
        <View style={styles.heroCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
            }}
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroHeart}>
              <Text style={styles.heroHeartText}>♥️</Text>
            </View>

            <Text style={styles.heroTitle}>
              What <Text style={styles.pinkText}>impact</Text>
              {"\n"}will you create today?
            </Text>

            <Text style={styles.heroSubtitle}>
              A small step from you can be{"\n"}
              a big change for someone.
            </Text>

            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate("CreateImpact")}
            >
              <Text style={styles.heroButtonText}>
                ＋ Create Impact
              </Text>

              <View style={styles.arrowCircle}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= THREE MAIN FEATURES ================= */}
        <View style={styles.featuresRow}>

          {/* Moments */}
          <TouchableOpacity
            style={[styles.smallFeature, styles.momentsCard]}
            onPress={() => navigation.navigate("Moments")}
          >
            <View style={[styles.featureIcon, styles.purpleIcon]}>
              <Text style={styles.featureIconText}>▣</Text>
            </View>

            <Text
          style={styles.smallFeatureTitle} numberOfLines={1}
          adjustsFontSizeToFit minimumFontScale={0.85}>
          Moments
         </Text>

            <Text style={styles.smallFeatureText}>
              Share your life,{"\n"}
              memories & thoughts
            </Text>

            <View style={[styles.smallArrow, styles.purpleIcon]}>
              <Text style={styles.smallArrowText}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Impact */}
          <TouchableOpacity
            style={[styles.smallFeature, styles.impactCard]}
            onPress={() => navigation.navigate("CreateImpact")}
          >
            <View style={[styles.featureIcon, styles.pinkIcon]}>
              <Text style={styles.featureIconText}>♥️</Text>
            </View>

            <Text style={styles.smallFeatureTitle} numberOfLines={1} 
            adjustsFontSizeToFit minimumFontScale={0.85}>
            Impact
           </Text>

            <Text style={styles.smallFeatureText}>
              Inspire, help &{"\n"}
              make a difference
            </Text>

            <View style={[styles.smallArrow, styles.pinkIcon]}>
              <Text style={styles.smallArrowText}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Community */}
          <TouchableOpacity
            style={[styles.smallFeature, styles.communityCard]}
            onPress={() => navigation.navigate("Community")}
          >
            <View style={[styles.featureIcon, styles.greenIcon]}>
              <Text style={styles.featureIconText}>♣️</Text>
            </View>

            <Text style={styles.smallFeatureTitle} numberOfLines={1}
            adjustsFontSizeToFit minimumFontScale={0.85}>
            Community
            </Text>
            <Text style={styles.smallFeatureText}>
              Connect, support{"\n"}
              & grow together
            </Text>

            <View style={[styles.smallArrow, styles.greenIcon]}>
              <Text style={styles.smallArrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= RAISE YOUR VOICE ================= */}
        <TouchableOpacity
          style={styles.voiceCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("RaiseYourVoice")}
        >
          <View style={styles.voiceIconCircle}>
            <Text style={styles.voiceIcon}>📣</Text>
          </View>

          <View style={styles.voiceContent}>
            <Text style={styles.voiceTitle}>
              Raise Your Voice
            </Text>

            <Text style={styles.voiceSubtitle}>
              See an issue in your area?
              {"\n"}
              Speak up. Start a conversation.
            </Text>

            <View style={styles.voiceButton}>
              <Text style={styles.voiceButtonText}>
                Raise a Question
              </Text>
              <Text style={styles.voiceArrow}>›</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ================= AROUND YOU ================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>📍</Text>
            <Text style={styles.sectionTitle}>Around You</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.seeAll}>See All ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.aroundScroll}
        >
          <AroundCard
            image="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=500&q=80"
            title="Youth cleaned the beach"
            location="RK Beach"
            time="2h ago"
          />

          <AroundCard
            image="https://images.unsplash.com/photo-1559234938-b60fff04894d?auto=format&fit=crop&w=500&q=80"
            title="Helped an elderly person"
            location="MVP Colony"
            time="3h ago"
          />

          <AroundCard
            image="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80"
            title="Donated books to children"
            location="Kakinada"
            time="5h ago"
          />

          <AroundCard
            image="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80"
            title="Tree plantation drive"
            location="Gandhi Park"
            time="6h ago"
          />
        </ScrollView>

        {/* ================= IMPACT HAPPENING NOW ================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>♥️</Text>
            <Text style={styles.sectionTitle}>
              Impact happening now
            </Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.seeAll}>See All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <StatItem number="1,248" label="People Helped" icon="👥" />
          <View style={styles.statDivider} />
          <StatItem number="326" label="Positive Actions" icon="🤲" />
          <View style={styles.statDivider} />
          <StatItem number="18" label="Cities Involved" icon="🌍" />
        </View>

        {/* ================= TODAY'S INSPIRATION ================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>⭐</Text>
            <Text style={styles.sectionTitle}>
              Today's Inspiration
            </Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.seeAll}>See All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inspirationCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
            }}
            style={styles.inspirationImage}
          />

          <View style={styles.inspirationContent}>
            <Text style={styles.quote}>
              “I didn't have much to give,
              {"\n"}so I gave my time.”
            </Text>

            <Text style={styles.quoteAuthor}>
              — Someone from the community
            </Text>
          </View>

          <Text style={styles.bookmark}>♡</Text>
        </View>

        <View style={{ height: 25 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= AROUND CARD ================= */

function AroundCard({ image, title, location, time }) {
  return (
    <View style={styles.aroundCard}>
      <Image source={{ uri: image }} style={styles.aroundImage} />

      <View style={styles.aroundContent}>
        <Text style={styles.aroundTitle} numberOfLines={2}>
          {title}
        </Text>

        <Text style={styles.aroundLocation}>
          📍 {location}
        </Text>

        <Text style={styles.aroundTime}>{time}</Text>
      </View>
    </View>
  );
}

/* ================= STAT ITEM ================= */

function StatItem({ number, label, icon }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>

      <Text style={styles.statNumber}>{number}</Text>

      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },

  scrollContent: {
    paddingBottom: 20,
  },

/* ================= PREMIUM HEADER ================= */

topHeader: {
  height: 88,
  backgroundColor: "#ffffff",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 18,
  paddingTop: 8,
  borderBottomWidth: 1,
  borderBottomColor: "#f1f1f1",
},

menuButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f7f7f8",
},

menuLine: {
  width: 19,
  height: 2,
  borderRadius: 2,
  backgroundColor: "#171717",
  marginVertical: 2,
},

logo: {
  fontSize: 29,
  fontWeight: "800",
  color: "#111111",
  letterSpacing: -0.8,
},

logoHeart: {
  color: "#ef3b65",
  fontSize: 27,
},

headerActions: {
  flexDirection: "row",
  alignItems: "center",
},

headerAction: {
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f7f7f8",
  marginLeft: 8,
  position: "relative",
},

searchIcon: {
  fontSize: 29,
  color: "#171717",
  marginTop: -3,
},

notificationIcon: {
  fontSize: 26,
  color: "#171717",
  marginTop: -2,
},

notificationDot: {
  position: "absolute",
  right: 7,
  top: 6,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#ef3b65",
  borderWidth: 1.5,
  borderColor: "#f7f7f8",
},

  /* ================= PREMIUM GREETING ================= */

greetingRow: {
  backgroundColor: "#ffffff",
  paddingHorizontal: 18,
  paddingVertical: 18,
  flexDirection: "row",
  alignItems: "center",
},

avatar: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#f0f0f2",
  alignItems: "center",
  justifyContent: "center",
},

avatarText: {
  fontSize: 25,
  fontWeight: "800",
  color: "#111111",
},

greetingText: {
  flex: 1,
  marginLeft: 13,
  marginRight: 8,
},

greetingTitle: {
  fontSize: 16,
  lineHeight: 21,
  fontWeight: "800",
  color: "#111111",
},

greetingSubtitle: {
  fontSize: 13,
  lineHeight: 18,
  color: "#666666",
  marginTop: 5,
},

weather: {
  width: 100,
  minHeight: 78,
  borderRadius: 20,
  backgroundColor: "#f7f7f9",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 8,
},

weatherIcon: {
  fontSize: 20,
  marginBottom: 1,
},

temperature: {
  fontSize: 16,
  fontWeight: "800",
  color: "#111111",
},

location: {
  maxWidth: 88,
  fontSize: 10,
  color: "#666666",
  marginTop: 2,
},

  /* Hero */

  heroCard: {
    height: 315,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 25,
    overflow: "hidden",
  },

  heroImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  heroOverlay: {
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(255,238,228,0.54)",
},

  heroContent: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  heroHeart: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  heroHeartText: {
    color: "#ef3b65",
    fontSize: 24,
  },

  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#111111",
  },

  pinkText: {
    color: "#ef3b65",
  },

  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#222222",
    marginTop: 10,
  },

  heroButton: {
    marginTop: 18,
    backgroundColor: "#ef3b65",
    borderRadius: 28,
    paddingLeft: 18,
    paddingRight: 7,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  heroButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },

  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    color: "#ef3b65",
    fontSize: 30,
    lineHeight: 31,
  },

  /* Feature Cards */

  featuresRow: {
  flexDirection: "row",
  paddingHorizontal: 12,
  marginTop: 16,
},

  smallFeature: {
  flex: 1,
  height: 300,
  borderRadius: 22,
  padding: 14,
  marginHorizontal: 4,
  borderWidth: 1,
  borderColor: "#eeeeee",
},

  momentsCard: {
    backgroundColor: "#f3efff",
  },

  impactCard: {
    backgroundColor: "#fff0f4",
  },

  communityCard: {
    backgroundColor: "#eefaf3",
  },

  featureIcon: {
  width: 50,
  height: 50,
  borderRadius: 15,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
},

  purpleIcon: {
    backgroundColor: "#7344df",
  },

  pinkIcon: {
    backgroundColor: "#ef3b65",
  },

  greenIcon: {
    backgroundColor: "#26b86d",
  },

  featureIconText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
  },

  smallFeatureTitle: {
  fontSize: 17,
  lineHeight: 21,
  fontWeight: "800",
  color: "#111111",
  includeFontPadding: false,
  flexShrink: 1,
},

  smallFeatureText: {
  fontSize: 12,
  lineHeight: 18,
  color: "#444444",
  marginTop: 8,
},

  smallArrow: {
  width: 34,
  height: 34,
  borderRadius: 17,
  marginTop: 18,
  alignItems: "center",
  justifyContent: "center",
},

  smallArrowText: {
  color: "#ffffff",
  fontSize: 25,
  lineHeight: 27,
  fontWeight: "500",
},

  /* Section */

  sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 18,
  marginTop: 24,
  marginBottom: 12,
},

  sectionTitleRow: {
  flexDirection: "row",
  alignItems: "center",
},

  sectionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },

  sectionTitle: {
  fontSize: 20,
  fontWeight: "800",
  color: "#111111",
  letterSpacing: -0.3,
},

  seeAll: {
    fontSize: 13,
    color: "#555555",
    fontWeight: "700",
  },

/* ================= AROUND YOU CARDS ================= */

aroundScroll: {
  paddingLeft: 18,
  paddingRight: 8,
},

aroundCard: {
  width: 215,
  backgroundColor: "#ffffff",
  borderRadius: 20,
  overflow: "hidden",
  marginRight: 12,
  borderWidth: 1,
  borderColor: "#eeeeee",
},

aroundImage: {
  width: "100%",
  height: 128,
},

aroundContent: {
  paddingHorizontal: 12,
  paddingTop: 11,
  paddingBottom: 13,
},

aroundTitle: {
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "800",
  color: "#111111",
  minHeight: 40,
},

aroundLocation: {
  fontSize: 12,
  color: "#555555",
  marginTop: 8,
},

aroundTime: {
  fontSize: 11,
  color: "#999999",
  marginTop: 5,
},

  /* Stats */

  statsCard: {
  marginHorizontal: 16,
  backgroundColor: "#fff5f7",
  borderRadius: 22,
  borderWidth: 1,
  borderColor: "#f0e2e6",
  paddingVertical: 20,
  flexDirection: "row",
  alignItems: "center",
},

  statItem: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 4,
},

  statIcon: {
  fontSize: 24,
  marginBottom: 5,
},

  statNumber: {
  fontSize: 20,
  fontWeight: "800",
  color: "#111111",
  letterSpacing: -0.3,
},

  statLabel: {
  fontSize: 10,
  lineHeight: 14,
  color: "#666666",
  marginTop: 4,
  textAlign: "center",
},

  statDivider: {
  width: 1,
  height: 52,
  backgroundColor: "#e3d9dc",
},

/* ================= TODAY'S INSPIRATION ================= */

inspirationCard: {
  marginHorizontal: 16,
  minHeight: 132,
  backgroundColor: "#fff9e9",
  borderRadius: 22,
  overflow: "hidden",
  flexDirection: "row",
  borderWidth: 1,
  borderColor: "#eee7d5",
},

inspirationImage: {
  width: 128,
  height: 132,
},

inspirationContent: {
  flex: 1,
  justifyContent: "center",
  paddingLeft: 15,
  paddingRight: 34,
  paddingVertical: 12,
},

quote: {
  fontSize: 15,
  lineHeight: 21,
  fontWeight: "700",
  color: "#222222",
},

quoteAuthor: {
  fontSize: 11,
  lineHeight: 15,
  color: "#777777",
  marginTop: 9,
},

bookmark: {
  position: "absolute",
  right: 12,
  top: 10,
  fontSize: 27,
  color: "#555555",
},
/* ================= RAISE YOUR VOICE ================= */

voiceCard: {
  marginHorizontal: 16,
  marginTop: 18,
  padding: 20,
  borderRadius: 24,
  backgroundColor: "#fff4f6",
  borderWidth: 1,
  borderColor: "#f4dfe5",
  flexDirection: "row",
  alignItems: "center",
},

voiceIconCircle: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#ef3b65",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 15,
},

voiceIcon: {
  fontSize: 28,
},

voiceContent: {
  flex: 1,
},

voiceTitle: {
  fontSize: 20,
  fontWeight: "800",
  color: "#111111",
},

voiceSubtitle: {
  fontSize: 13,
  lineHeight: 19,
  color: "#666666",
  marginTop: 5,
},

voiceButton: {
  alignSelf: "flex-start",
  marginTop: 12,
  paddingHorizontal: 13,
  paddingVertical: 8,
  borderRadius: 18,
  backgroundColor: "#ef3b65",
  flexDirection: "row",
  alignItems: "center",
},

voiceButtonText: {
  color: "#ffffff",
  fontSize: 12,
  fontWeight: "800",
},

voiceArrow: {
  color: "#ffffff",
  fontSize: 20,
  lineHeight: 18,
  marginLeft: 7,
},
});