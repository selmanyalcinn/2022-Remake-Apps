import "react-native-gesture-handler";
import * as React from "react";
import { Animated, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { PreferencesProvider } from "./src/context/PreferencesContext";
import Home from "./Pages/Home";
import GameOffline from "./Pages/Game";
import Daily from "./Pages/Daily";
import Settings from "./Pages/Settings";
import Legal from "./Pages/Legal";

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Random Game" component={GameOffline} />
      <Stack.Screen name="Daily" component={Daily} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Legal" component={Legal} />
    </Stack.Navigator>
  );
}

function MainApp() {
  const { isDark, theme } = useTheme();
  const themeOpacity = React.useRef(new Animated.Value(1)).current;
  const hasRendered = React.useRef(false);

  React.useEffect(() => {
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
        <MyStack />
      </NavigationContainer>
    </Animated.View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PreferencesProvider>
          <MainApp />
        </PreferencesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
