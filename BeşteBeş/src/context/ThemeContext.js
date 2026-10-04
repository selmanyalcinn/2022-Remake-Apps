import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors } from "../theme/colors.js";

const THEME_KEY = "@beste_bes_theme_mode";

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  setThemeMode: () => {},
  theme: darkColors,
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (active && saved !== null) setIsDark(saved === "dark");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setThemeMode = useCallback((dark) => {
    setIsDark(dark);
    AsyncStorage.setItem(THEME_KEY, dark ? "dark" : "light").catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light").catch(() => {});
      return next;
    });
  }, []);

  const theme = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ isDark, toggleTheme, setThemeMode, theme }),
    [isDark, toggleTheme, setThemeMode, theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
