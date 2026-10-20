import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Comment from "./screens/Comment";
import Login from "./screens/Login";
import Signup from "./screens/signup";
import Home from "./screens/Home";
import MomentHome from "./screens/MomentHome";
import CreatePost from "./screens/CreatePost";
import CreateImpact from "./screens/CreateImpact";
import CreateInitiative from "./screens/CreateInitiative";
import RaiseYourVoice from "./screens/RaiseYourVoice";
import RaiseQuestion from "./screens/RaiseQuestion";
import Profile from "./screens/Profile";
import EditProfile from "./screens/EditProfile";
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
import MyMoments from "./screens/MyMoments";
import MyInitiatives from "./screens/MyInitiatives";
import JoinedInitiatives from "./screens/JoinedInitiatives";
import InitiativeDetails from "./screens/InitiativeDetails";
import MyImpacts from "./screens/MyImpacts";
import ImpactDashboard from "./screens/ImpactDashboard";
import PeopleHelped from "./screens/PeopleHelped";
import EditImpact from "./screens/EditImpact";
import Followers from "./screens/Followers";
import Following from "./screens/Following";
import ImpactDetails from "./screens/ImpactDetails";
import ImpactComments from "./screens/ImpactComments";
import EditMoment from "./screens/EditMoment";
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
      <Stack.Screen name="CreateInitiative" component={CreateInitiative}/>
      <Stack.Screen name="RaiseYourVoice" component={RaiseYourVoice}/>
      <Stack.Screen name="RaiseQuestion" component={RaiseQuestion}/>
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="SavedMoments" component={SavedMoments} />
      <Stack.Screen name="MyMoments" component={MyMoments} />
      <Stack.Screen name="Comment" component={Comment} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="UserProfile" component={UserProfile}/>
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="MyInitiatives" component={MyInitiatives} />
      <Stack.Screen name="JoinedInitiatives" component={JoinedInitiatives} />
      <Stack.Screen name="InitiativeDetails" component={InitiativeDetails} />
      <Stack.Screen name="MyImpacts" component={MyImpacts} />
      <Stack.Screen name="ImpactDashboard" component={ImpactDashboard} />
      <Stack.Screen name="EditImpact" component={EditImpact} />
      <Stack.Screen name="PeopleHelped" component={PeopleHelped} />
      <Stack.Screen name="Followers" component={Followers} />
      <Stack.Screen name="Following" component={Following} />
      <Stack.Screen name="ImpactDetails" component={ImpactDetails} />
      <Stack.Screen name="ImpactComments" component={ImpactComments} />
      <Stack.Screen name="EditMoment" component={EditMoment} />
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