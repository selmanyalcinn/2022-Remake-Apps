import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { AppState } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./Pages/Home";
import Scanned from "./Pages/Scanned";
import Home2 from "./Pages/Home2";

const Stack = createStackNavigator();

function App() {
  return (
    <Stack.Navigator
      initialRouteName="Scan Code"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#111827",
          borderBottomWidth: 1,
          borderBottomColor: "#1f2937",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#ffffff",
        headerTitleAlign: "left",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 22,
          color: "#ffffff",
        },
      }}
    >
      <Stack.Screen
        name="Scan Code"
        component={Home}
        options={{ title: "Qode" }}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Result"
        component={Scanned}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Home2"
        component={Home2}
      />
    </Stack.Navigator>
  );
}

export default function Main() {
  useEffect(() => {
    const lockPortrait = () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT,
      ).catch(() => {});
      ScreenOrientation.lockPlatformAsync({
        screenOrientationConstantAndroid: 1,
      }).catch(() => {});
    };

    lockPortrait();
    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          lockPortrait();
        }
      },
    );
    const orientationSubscription =
      ScreenOrientation.addOrientationChangeListener(lockPortrait);

    return () => {
      appStateSubscription.remove();
      ScreenOrientation.removeOrientationChangeListener(
        orientationSubscription,
      );
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <App />
    </NavigationContainer>
  );
}
