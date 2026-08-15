import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Comment from "./screens/Comment";
import Login from "./screens/Login";
import Signup from "./screens/signup";
import Home from "./screens/Home";
import MomentHome from "./screens/MomentHome";
import CreatePost from "./screens/CreatePost";
import CreateImpact from "./screens/CreateImpact";
import Profile from "./screens/Profile";
import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Search from "./screens/Search";
import CommunityHome from "./screens/CommunityHome";
import UserProfile from "./screens/UserProfile";
import Stories from "./screens/Stories";
import CreateStory from "./screens/CreateStory";
import StoryViews from "./screens/StoryViews";
import StoryReply from "./screens/StoryReply";
import StoryReplies from "./screens/StoryReplies";
import Messages from "./screens/Messages";
import Chat from "./screens/Chat";
import Notifications from "./screens/Notifications";
import SavedMoments from "./screens/SavedMoments";
import Followers from "./screens/Followers";
import Following from "./screens/Following";
import MainTabs from "./navigation/MainTabs";


const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });

  return unsubscribe;
}, []);

if (loading) {
  return null;
}
  return (
    <NavigationContainer>
<Stack.Navigator screenOptions={{ headerShown: false }}>
  {user ? (
  <>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CreateImpact" component={CreateImpact} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="SavedMoments" component={SavedMoments} />
      <Stack.Screen name="Comment" component={Comment} />
      <Stack.Screen name="Search" component={Search} />
     <Stack.Screen name="UserProfile" component={UserProfile}/>
      <Stack.Screen name="Followers" component={Followers} />
      <Stack.Screen name="Following" component={Following} />
      <Stack.Screen name="Stories" component={Stories} />
      <Stack.Screen name="CreateStory" component={CreateStory}/>
      <Stack.Screen name="StoryViews" component={StoryViews}/>
      <Stack.Screen name="StoryReply" component={StoryReply}/>
      <Stack.Screen name="RepliesTest" component={StoryReplies}/>
      <Stack.Screen name="Messages" component={Messages}/>
      <Stack.Screen name="Chat" component={Chat}/>
      <Stack.Screen name="Notifications" component={Notifications}/>
    </>
  ) : (
    <>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </>
  )}
</Stack.Navigator>
    </NavigationContainer>
  );
}