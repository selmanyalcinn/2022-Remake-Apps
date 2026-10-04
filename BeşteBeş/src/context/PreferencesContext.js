import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translate } from "../i18n/translations.js";

const HAPTICS_KEY = "@beste_bes_haptics_enabled";
const LANGUAGE_KEY = "@beste_bes_language";

const getDeviceLanguage = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || "tr";
    return locale.toLowerCase().startsWith("tr") ? "tr" : "en";
  } catch {
    return "tr";
  }
};

const PreferencesContext = createContext({
  hapticsEnabled: true,
  setHapticsEnabled: () => {},
  language: "tr",
  setLanguage: (_value) => {},
  t: (key, _params) => key,
});

export const PreferencesProvider = ({ children }) => {
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [language, setLanguageState] = useState(getDeviceLanguage);

  useEffect(() => {
    let active = true;
    AsyncStorage.multiGet([HAPTICS_KEY, LANGUAGE_KEY])
      .then((entries) => {
        if (!active) return;
        const values = Object.fromEntries(entries);
        if (values[HAPTICS_KEY] !== null) setHapticsEnabledState(values[HAPTICS_KEY] === "true");
        if (values[LANGUAGE_KEY]) setLanguageState(values[LANGUAGE_KEY]);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const setHapticsEnabled = useCallback((value) => {
    setHapticsEnabledState(value);
    AsyncStorage.setItem(HAPTICS_KEY, String(value)).catch(() => {});
  }, []);

  const setLanguage = useCallback((value) => {
    setLanguageState(value);
    AsyncStorage.setItem(LANGUAGE_KEY, value).catch(() => {});
  }, []);

  const t = useCallback((key, params) => translate(language, key, params), [language]);

  const value = useMemo(
    () => ({ hapticsEnabled, setHapticsEnabled, language, setLanguage, t }),
    [hapticsEnabled, setHapticsEnabled, language, setLanguage, t]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => useContext(PreferencesContext);
