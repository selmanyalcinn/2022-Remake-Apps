import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "../theme/colors";

export const THEME_STORAGE_KEY = "Mather_Theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedTheme) => {
        if (!active || !savedTheme) return;
        setIsDark(savedTheme === "dark");
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const theme = isDark ? darkColors : lightColors;
  const setThemeMode = useCallback((dark) => {
    setIsDark(dark);
    AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light").catch(
      () => {}
    );
  }, []);
  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light").catch(
        () => {}
      );
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, isDark, toggleTheme, setThemeMode }),
    [theme, isDark, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
