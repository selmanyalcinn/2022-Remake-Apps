import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme, CURRENCIES } from "../Utils/theme";
import { translate, SUPPORTED_LANGUAGES } from "../Utils/i18n";

const AppContext = createContext({});

export function AppProvider({ children }) {
  const colorScheme = useColorScheme();
  // Yeni kurulumlar marka paletiyle uyumlu koyu temada başlar. Kayıtlı
  // kullanıcı tercihi aşağıda depodan geri yüklenmeye devam eder.
  const [themeMode, setThemeMode] = useState("dark");
  const [language, setLanguage] = useState("en");
  const isDark = themeMode === "dark" || (themeMode === "system" && colorScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  const [favorites, setFavorites] = useState([]);
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const currency = CURRENCIES[currencyIndex];

  // AsyncStorage'dan favori ve para birimi yükle
  useEffect(() => {
    const load = async () => {
      try {
        const [storedFavs, storedCurrency, storedThemeMode, storedLanguage] = await Promise.all([
          AsyncStorage.getItem("@favorites"),
          AsyncStorage.getItem("@currencyIndex"),
          AsyncStorage.getItem("@themeMode"),
          AsyncStorage.getItem("@language"),
        ]);

        if (storedFavs) {
          const parsed = JSON.parse(storedFavs);
          if (Array.isArray(parsed)) {
            setFavorites(parsed.filter((id) => typeof id === "string"));
          }
        }

        const parsedCurrency = Number.parseInt(storedCurrency, 10);
        if (
          Number.isInteger(parsedCurrency) &&
          parsedCurrency >= 0 &&
          parsedCurrency < CURRENCIES.length
        ) {
          setCurrencyIndex(parsedCurrency);
        }

        if (["dark", "light", "system"].includes(storedThemeMode)) {
          setThemeMode(storedThemeMode);
        }
        if (SUPPORTED_LANGUAGES.includes(storedLanguage)) {
          setLanguage(storedLanguage);
        }
      } catch (e) {
        console.warn("AppContext load error:", e);
      } finally {
        setIsReady(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("@themeMode", themeMode).catch((e) =>
      console.warn("Theme save error:", e)
    );
  }, [isReady, themeMode]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("@language", language).catch((e) =>
      console.warn("Language save error:", e)
    );
  }, [isReady, language]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("@favorites", JSON.stringify(favorites)).catch((e) =>
      console.warn("Favorites save error:", e)
    );
  }, [favorites, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem("@currencyIndex", String(currencyIndex)).catch((e) =>
      console.warn("Currency save error:", e)
    );
  }, [currencyIndex, isReady]);

  /** Coin'i favoriye ekler veya çıkarır. */
  const toggleFavorite = useCallback((coinId) => {
    setFavorites((prev) => {
      return prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId];
    });
  }, []);

  /** Coin'in favoride olup olmadığını kontrol eder */
  const isFavorite = useCallback(
    (coinId) => favorites.includes(coinId),
    [favorites]
  );

  /** Para birimini döngüsel olarak değiştirir: USD → EUR → TRY → USD */
  // Select the requested currency directly from Settings.
  const selectCurrency = useCallback((currencyCode) => {
    const nextIndex = CURRENCIES.findIndex(({ code }) => code === currencyCode);
    if (nextIndex >= 0) setCurrencyIndex(nextIndex);
  }, []);
  const t = useCallback(
    (key, params) => translate(language, key, params),
    [language]
  );

  const value = useMemo(
    () => ({
      theme,
      isDark,
      isReady,
      favorites,
      toggleFavorite,
      isFavorite,
      currency,
      selectCurrency,
      language,
      setLanguage,
      themeMode,
      setThemeMode,
      t,
    }),
    [
      theme,
      isDark,
      isReady,
      favorites,
      toggleFavorite,
      isFavorite,
      currency,
      selectCurrency,
      language,
      setLanguage,
      themeMode,
      t,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/** Uygulamanın global state'ine erişim hook'u */
export const useApp = () => useContext(AppContext);
