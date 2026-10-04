import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translate } from "../i18n/translations";

export const PREFERENCE_KEYS = {
  language: "Mather_Language",
  haptics: "Mather_HapticsEnabled",
};

function getDeviceLanguage() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
    return locale.toLowerCase().startsWith("tr") ? "tr" : "en";
  } catch {
    return "en";
  }
}

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [language, setLanguageState] = useState(getDeviceLanguage);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  useEffect(() => {
    let active = true;

    AsyncStorage.multiGet(Object.values(PREFERENCE_KEYS))
      .then((entries) => {
        if (!active) return;
        const values = Object.fromEntries(entries);
        if (values[PREFERENCE_KEYS.language]) {
          setLanguageState(values[PREFERENCE_KEYS.language]);
        }
        if (values[PREFERENCE_KEYS.haptics] != null) {
          setHapticsEnabledState(values[PREFERENCE_KEYS.haptics] === "true");
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((value) => {
    setLanguageState(value);
    AsyncStorage.setItem(PREFERENCE_KEYS.language, value).catch(() => {});
  }, []);

  const setHapticsEnabled = useCallback((value) => {
    setHapticsEnabledState(value);
    AsyncStorage.setItem(PREFERENCE_KEYS.haptics, String(value)).catch(() => {});
  }, []);

  const t = useCallback(
    (key, params) => translate(language, key, params),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      hapticsEnabled,
      setHapticsEnabled,
      t,
    }),
    [language, setLanguage, hapticsEnabled, setHapticsEnabled, t]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider");
  }
  return context;
}
