import React, { useEffect, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Animated, Easing, Dimensions, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { enableScreens } from "react-native-screens";
import Home from "./Pages/Home";
import Crypto from "./Pages/Crypto";
import Settings from "./Pages/Settings";
import { AppProvider, useApp } from "./Context/AppContext";

const Stack = createStackNavigator();
enableScreens(true);

function MyStack({ theme }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Home"
        component={Home}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Crypto"
        component={Crypto}
      />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}

function MainApp() {
  const { theme, isDark } = useApp();
  const themeOpacity = useRef(new Animated.Value(1)).current;
  const hasRendered = useRef(false);

  useEffect(() => {
    if (!hasRendered.current) {
      hasRendered.current = true;
      return undefined;
    }
    themeOpacity.setValue(0.86);
    Animated.timing(themeOpacity, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isDark, themeOpacity]);

  useEffect(() => {
    const { width, height } = Dimensions.get("window");
    const isTablet = Platform.OS === "ios"
      ? Platform.isPad
      : Math.min(width, height) >= 600;
    const orientationTask = isTablet
      ? ScreenOrientation.unlockAsync()
      : ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    orientationTask.catch(() => undefined);
  }, []);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.bg,
      card: theme.header,
      text: theme.text,
      border: theme.border,
      primary: theme.accent,
    },
  };

  return (
    <Animated.View style={{ flex: 1, backgroundColor: theme.bg, opacity: themeOpacity }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer theme={navigationTheme}>
        <MyStack theme={theme} />
      </NavigationContainer>
    </Animated.View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
