import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDS1HoC1k7lcniiB_3nDIWJ7ZKfVgccRVQ",
  authDomain: "moments-7c821.firebaseapp.com",
  projectId: "moments-7c821",
  storageBucket: "moments-7c821.firebasestorage.app",
  messagingSenderId: "875604034094",
  appId: "1:875604034094:web:ee97d97eef9ad54a2955bf"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
