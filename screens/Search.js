import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Search({ navigation }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUsers(data);
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Search Users
      </Text>

      <TextInput
        placeholder="Search users..."
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
        <TouchableOpacity
        onPress={() =>
        navigation.navigate("UserProfile", {
        user: item,
        })
        }
        >
            <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
            }}
          >
            <Image
              source={
                item.photoURL
                  ? { uri: item.photoURL }
                  : require("../assets/icon.png")
              }
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginRight: 15,
              }}
            />

            <View>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                {item.name}
              </Text>

              <Text>{item.email}</Text>
            </View>
            </View>

          </TouchableOpacity>
        )}
      />
    </View>
  );
}