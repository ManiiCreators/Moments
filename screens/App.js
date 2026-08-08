import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function App({ navigation }) {
  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Moments</Text>
      <Text style={styles.subtitle}>Share every moment that matters</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />

    <TouchableOpacity
  style={styles.button}
onPress={() => navigation.navigate("Home")}>
  <Text style={styles.buttonText}>Login</Text>
</TouchableOpacity>

     <TouchableOpacity
onPress={() => navigation.navigate("Signup")} 
>
  <Text style={styles.signup}>
    Don't have an account? Sign Up
  </Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#E1306C",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: "#E1306C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signup: {
    marginTop: 20,
    color: "#666",
  },
});