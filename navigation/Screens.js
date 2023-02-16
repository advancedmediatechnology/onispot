import { Animated, Dimensions, Easing } from "react-native";
// header for screens
import { Header, Icon } from "../components";
import { argonTheme, tabs } from "../constants";

import Articles from "../screens/Articles";
import { Block } from "galio-framework";
// drawer
import CustomDrawerContent from "./Menu";
import Elements from "../screens/Elements";
// screens
import Home from "../screens/Home";
import Enroll from "../screens/Enroll";
import EnrolledCampaigns from "../screens/EnrolledCampaigns";
import Onboarding from "../screens/Onboarding";
import Pro from "../screens/Pro";
import Post from "../screens/Post";
import SocialConnections from "../screens/SocialConnections";
import Publication from "../screens/Publication";
import Profile from "../screens/Profile";
import React from "react";
import Register from "../screens/Register";
import Account from "../screens/Account";
import Campaign from "../screens/Campaign";
import CampaignCreativity from "../screens/CampaignCreativity";
import CampaignPrefs from "../screens/CampaignPrefs";
import CampaignTarget from "../screens/CampaignTarget";
import CampaignAudience from "../screens/CampaignAudience";
import Connect from "../screens/Connect"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import CheckoutFormWrapper from "../screens/CheckoutFormWrapper";

const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MyCampaignsStack(props) {
  return (
    <Stack.Navigator screenOptions={{ mode: "card", headerShown: "screen",}}>
      <Stack.Screen
        name="Articles"
        component={Articles}
        options={{
          header: ({ navigation, scene }) => (
            <Header 
              title="My campaigns"
              navigation={navigation} 
              scene={scene} 
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Newcampaign"
        component={Campaign}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Campaign"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="CampaignCreativity"
        component={CampaignCreativity}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Campaign creativity"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="CampaignPrefs"
        component={CampaignPrefs}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Campaign categories & styles"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="CampaignTarget"
        component={CampaignTarget}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Campaign target"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="CampaignAudience"
        component={CampaignAudience}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Campaign audience"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="CheckoutForm"
        component={CheckoutFormWrapper}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Checkout"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
    </Stack.Navigator>
  );
}

function SocialStack(props) {
  return (
    <Stack.Navigator screenOptions={{ mode: "card", headerShown: "screen", }}>
      <Stack.Screen
        name="Socials"
        component={Profile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Socials"
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Connect"
        component={Connect}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Social Connect"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack(props) {
  return (
    <Stack.Navigator screenOptions={{ mode: "card",  headerShown: "screen" }}>
      <Stack.Screen
        name="HomeInt"
        component={Home}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Home"
              search
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Enrollcampaign"
        component={Enroll}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Enroll"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
    </Stack.Navigator>
  );
}

function EnrolledStack(props) {
  return (
    <Stack.Navigator screenOptions={{mode: "card", headerShown: "screen",}} >
      <Stack.Screen
        name="EnrolledInt"
        component={EnrolledCampaigns}
        options={{
          header: ({ navigation, scene }) => (
            <Header 
              title="Enrolled campaigns" 
              navigation={navigation} 
              scene={scene} 
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Post"
        component={Post}
        options={{
          header: ({ navigation, scene }) => (
            <Header 
              title="Post" 
              back
              navigation={navigation} 
              scene={scene} 
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="SocialConnection"
        component={SocialConnections}
        options={{
          header: ({ navigation, scene }) => (
            <Header 
              title="Social connection" 
              back
              navigation={navigation} 
              scene={scene} 
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Publications"
        component={Publication}
        options={{
          header: ({ navigation, scene }) => (
            <Header 
              title="Publications" 
              back
              navigation={navigation} 
              scene={scene} 
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
    </Stack.Navigator>
  );
}

function AccountStack(props) {
  return (
    <Stack.Navigator screenOptions={{mode: "card", headerShown: "screen",}} >
      <Stack.Screen
        name="AccountInt"
        component={Account}
        options={{
          header: ({ navigation, scene }) => (
            <Header 
              title="Account" 
              navigation={navigation} 
              scene={scene} 
              tabs={[{id: 'wallet', title: 'Wallet'},{id: 'personal', title: 'Personal data'},{id: 'preferences', title: 'Categories'},{id: 'styles', title: 'Styles'},{id: 'audience', title: 'My audience'}]}
              tabIndex={0}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Pro"
        component={Pro}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default function OnboardingStack(props) {
  return (
    <Stack.Navigator screenOptions={{mode: "card",headerShown: false,}} >
      <Stack.Screen name="Onboarding" component={Onboarding}  />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="App" component={AppStack} />
    </Stack.Navigator>
  );
}

function AppStack(props) {
  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      drawerStyle={{
        backgroundColor: "white",
        width: width * 0.8,
      }}
      drawerContentOptions={{
        activeTintcolor: "white",
        inactiveTintColor: "#000",
        activeBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.75,
          backgroundColor: "transparent",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal",
        },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Socials"
        component={SocialStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Account"
        component={AccountStack}
        initialParams={{ itemId: 'wallet' }}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="My campaigns"
        component={MyCampaignsStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Enrolled campaigns"
        component={EnrolledStack}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}
