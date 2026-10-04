import "react-native-gesture-handler";
import React from "react";
import { Animated, Easing, Platform } from "react-native";
import * as Device from "expo-device";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext.js";
import { PreferencesProvider } from "./src/context/PreferencesContext.js";
import { HomeScreen } from "./src/screens/HomeScreen.js";
import { WordleGameScreen } from "./src/screens/WordleGameScreen.js";
import { SettingsScreen } from "./src/screens/SettingsScreen.js";
import { LegalScreen } from "./src/screens/LegalScreen.js";

const Stack = createStackNavigator();

const MainNavigator = () => {
  const { isDark, theme } = useTheme();
  const themeOpacity = React.useRef(new Animated.Value(1)).current;
  const hasRendered = React.useRef(false);

  React.useEffect(() => {
    if (!hasRendered.current) {
      hasRendered.current = true;
      return;
    }
    themeOpacity.setValue(0.86);
    Animated.timing(themeOpacity, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isDark, themeOpacity]);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.surfaceBorder,
      primary: theme.correct,
    },
  };

  return (
    <Animated.View style={{ flex: 1, backgroundColor: theme.background, opacity: themeOpacity }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          id="RootStack"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyle: { backgroundColor: theme.background },
            cardStyleInterpolator:
              Platform.OS === "web"
                ? CardStyleInterpolators.forFadeFromBottomAndroid
                : CardStyleInterpolators.forHorizontalIOS,
            transitionSpec: {
              open: { animation: "timing", config: { duration: 260, easing: Easing.out(Easing.cubic) } },
              close: { animation: "timing", config: { duration: 220, easing: Easing.inOut(Easing.cubic) } },
            },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="WordleGame" component={WordleGameScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Legal" component={LegalScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
};

export default function App() {
  React.useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }

    let isMounted = true;

    const applyDeviceOrientationPolicy = async () => {
      const deviceType = Device.deviceType ?? (await Device.getDeviceTypeAsync());

      if (!isMounted) {
        return;
      }

      const orientationLock =
        deviceType === Device.DeviceType.TABLET
          ? ScreenOrientation.OrientationLock.DEFAULT
          : ScreenOrientation.OrientationLock.PORTRAIT_UP;

      await ScreenOrientation.lockAsync(orientationLock);
    };

    applyDeviceOrientationPolicy().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PreferencesProvider>
          <MainNavigator />
        </PreferencesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
