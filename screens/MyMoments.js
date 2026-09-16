import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";

const MyMoments = ({ route }) => {
  const { moments = [], selectedIndex = 0 } = route.params || {};

  return (
    <View style={styles.container}>
      <FlatList
  data={moments}
  keyExtractor={(item) => item.id}
  initialScrollIndex={selectedIndex}
  getItemLayout={(data, index) => ({
    length: 450,
    offset: 450 * index,
    index,
  })}
  renderItem={({ item }) => (
          <View style={styles.momentCard}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
              />
            ) : null}

            {item.caption ? (
              <Text style={styles.caption}>
                {item.caption}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  momentCard: {
    marginBottom: 20,
    padding: 15,
  },

  image: {
    width: "100%",
    height: 400,
    borderRadius: 15,
  },

  caption: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default MyMoments;