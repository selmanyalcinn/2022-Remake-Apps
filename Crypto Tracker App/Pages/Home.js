import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ListItem from "../Components/ListItem";
import {
  getCachedMarketData,
  getMarketData,
} from "../Services/cryptoService";
import { useApp } from "../Context/AppContext";

const SORT_OPTIONS = [
  { id: "market_cap", labelKey: "marketCap" },
  { id: "price", labelKey: "price" },
  { id: "change_1h", labelKey: "oneHour" },
  { id: "change_24h", labelKey: "twentyFourHours" },
  { id: "change_7d", labelKey: "sevenDays" },
];

const getErrorMessage = (error, t) => {
  if (error?.message?.includes("API adresi yapılandırılmamış")) {
    return t("apiConfigError");
  }
  if (error?.status === 429) {
    return t("chartRateLimit");
  }
  if (error?.message?.includes("zaman aşımına")) return error.message;
  return t("chartError");
};

export default function Home() {
  const {
    theme,
    isDark,
    isReady,
    favorites,
    currency,
    t,
  } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const requestId = useRef(0);
  const displayedCurrency = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("market_cap");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchMarketData = useCallback(
    async (force = false) => {
      if (!isReady) return;

      const currentRequestId = ++requestId.current;
      const cached = force ? null : getCachedMarketData(currency.code);

      if (cached) {
        displayedCurrency.current = currency.code;
        setData(cached);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setError(null);
      if (force) setRefreshing(true);
      else if (displayedCurrency.current !== currency.code) {
        setData([]);
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const marketData = await getMarketData(currency.code, { force });
        if (requestId.current === currentRequestId) {
          displayedCurrency.current = currency.code;
          setData(marketData);
        }
      } catch (fetchError) {
        if (requestId.current === currentRequestId) {
          setError(getErrorMessage(fetchError, t));
        }
      } finally {
        if (requestId.current === currentRequestId) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [currency.code, isReady, t]
  );

  useFocusEffect(
    useCallback(() => {
      fetchMarketData();
      return () => {
        requestId.current += 1;
      };
    }, [fetchMarketData])
  );

  const onRefresh = useCallback(() => fetchMarketData(true), [fetchMarketData]);
  const favoriteIds = useMemo(() => new Set(favorites), [favorites]);

  const searchFiltered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter(
      (coin) =>
        coin.name?.toLowerCase().includes(query) ||
        coin.symbol?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const displayData = useMemo(() => {
    const filtered = showFavoritesOnly
      ? searchFiltered.filter((coin) => favoriteIds.has(coin.id))
      : searchFiltered;

    const valueFor = (coin) => {
      switch (sortBy) {
        case "price":
          return coin.current_price;
        case "change_1h":
          return coin.price_change_percentage_1h_in_currency;
        case "change_24h":
          return coin.price_change_percentage_24h;
        case "change_7d":
          return coin.price_change_percentage_7d_in_currency;
        default:
          return null;
      }
    };

    if (sortBy === "market_cap") return filtered;
    return [...filtered].sort((a, b) => {
      const aValue = valueFor(a);
      const bValue = valueFor(b);
      if (!Number.isFinite(aValue)) return 1;
      if (!Number.isFinite(bValue)) return -1;
      return bValue - aValue;
    });
  }, [favoriteIds, searchFiltered, showFavoritesOnly, sortBy]);

  const renderItem = useCallback(
    ({ item }) => (
      <ListItem
        coinId={item.id}
        name={item.name}
        symbol={item.symbol?.toUpperCase()}
        currentPrice={item.current_price}
        priceChangePercentage={item.price_change_percentage_7d_in_currency}
        logoUrl={item.image}
        onPress={() =>
          navigation.navigate("Crypto", {
            item,
            currencyCode: currency.code,
          })
        }
      />
    ),
    [currency.code, navigation]
  );

  const renderContent = () => {
    if (loading || !isReady) {
      return (
        <View style={styles.CenteredArea}>
          <ActivityIndicator size="large" color={theme.activityIndicator} />
          <Text style={[styles.InfoText, { color: theme.subtext }]}>
            {t("loadingPrices")}
          </Text>
        </View>
      );
    }

    if (error && !data.length) {
      return (
        <View style={styles.CenteredArea}>
          <Ionicons name="cloud-offline-outline" size={52} color={theme.subtext} />
          <Text style={[styles.InfoText, { color: theme.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.RetryButton, { backgroundColor: theme.accent }]}
            onPress={() => fetchMarketData(true)}
            accessibilityRole="button"
            accessibilityLabel={t("retryData")}
          >
            <Text style={styles.RetryButtonText}>{t("retry")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        keyExtractor={(item) => item.id}
        data={displayData}
        renderItem={renderItem}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        getItemLayout={(_, index) => ({ length: 84, offset: 84 * index, index })}
        contentContainerStyle={displayData.length ? styles.ListContent : styles.EmptyListContent}
        ListHeaderComponent={
          error ? (
            <View style={[styles.InlineError, { backgroundColor: theme.pillNegBg }]}>
              <Ionicons name="warning-outline" size={17} color={theme.error} />
              <Text style={[styles.InlineErrorText, { color: theme.error }]}>
                {t("staleData")}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.Attribution}
            onPress={() => Linking.openURL("https://www.coingecko.com/")}
            accessibilityRole="link"
            accessibilityLabel={t("attribution")}
          >
            <Text style={[styles.AttributionText, { color: theme.subtext }]}>
              {t("attribution")}
            </Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.CenteredArea}>
            <Ionicons name="search-outline" size={52} color={theme.subtext} />
            <Text style={[styles.InfoText, { color: theme.subtext }]}>
              {showFavoritesOnly
                ? t("favoritesEmpty")
                : t("searchEmpty", { query: searchQuery })}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.activityIndicator]}
            tintColor={theme.activityIndicator}
          />
        }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={[styles.Container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={[
          styles.Header,
          { paddingTop: insets.top + 12, backgroundColor: theme.header },
        ]}
      >
        <View style={styles.TitleRow}>
          <Text style={[styles.Title, { color: theme.text }]}>Cryptic</Text>
          <View style={styles.HeaderActions}>
            <TouchableOpacity
              style={[
                styles.ActionBtn,
                showFavoritesOnly && { backgroundColor: theme.accentLight },
              ]}
              onPress={() => setShowFavoritesOnly((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={t("favoritesFilter")}
              accessibilityState={{ selected: showFavoritesOnly }}
            >
              <View style={styles.FavIconWrapper}>
                <Ionicons
                  name={showFavoritesOnly ? "heart" : "heart-outline"}
                  size={21}
                  color={showFavoritesOnly ? theme.favActive : theme.text}
                />
                {favorites.length > 0 && (
                  <View
                    style={[
                      styles.FavBadge,
                      { backgroundColor: theme.favActive, borderColor: theme.header },
                    ]}
                  >
                    <Text style={styles.FavBadgeText}>
                      {favorites.length > 99 ? "99+" : favorites.length}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ActionBtn}
              onPress={() => navigation.navigate("Settings")}
              accessibilityRole="button"
              accessibilityLabel={t("settings")}
            >
              <Ionicons name="settings-outline" size={21} color={theme.text} />
            </TouchableOpacity>

          </View>
        </View>

        <View style={[styles.SearchBar, { backgroundColor: theme.searchBg }]}>
          <Ionicons name="search" size={18} color={theme.subtext} />
          <TextInput
            style={[styles.SearchInput, { color: theme.text }]}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t("searchCoin")}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t("clearSearch")}
            >
              <Ionicons name="close-circle" size={19} color={theme.subtext} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.SortScroll}
          contentContainerStyle={styles.SortContainer}
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = sortBy === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSortBy(option.id)}
                style={[
                  styles.SortChip,
                  {
                    backgroundColor: isActive
                      ? theme.chipActiveBg
                      : theme.chipInactiveBg,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    styles.SortChipText,
                    {
                      color: isActive
                        ? theme.chipActiveText
                        : theme.chipInactiveText,
                    },
                  ]}
                >
                  {t(option.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!loading && (
          <Text style={[styles.CoinCount, { color: theme.subtext }]}>
            {t("coinCount", { count: displayData.length })}
          </Text>
        )}
      </View>

      <View style={[styles.ListArea, { backgroundColor: theme.homeBg }]}> 
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: { flex: 1 },
  Header: {
    paddingBottom: 8,
    paddingHorizontal: "5%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1,
  },
  TitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  Title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  HeaderActions: { flexDirection: "row", alignItems: "center" },
  ActionBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 12,
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  FavIconWrapper: {
    position: "relative",
    width: 21,
    height: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  FavBadge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    borderWidth: 1.5,
  },
  FavBadgeText: {
    color: "white",
    fontSize: 8.5,
    fontWeight: "800",
    lineHeight: 10,
  },
  SearchBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  SearchInput: { flex: 1, fontSize: 14, marginLeft: 6, paddingVertical: 8 },
  SortScroll: { marginBottom: 5 },
  SortContainer: { paddingRight: 8 },
  SortChip: {
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    marginRight: 6,
    justifyContent: "center",
  },
  SortChipText: { fontSize: 12, fontWeight: "600" },
  CoinCount: { fontSize: 11, marginTop: 1 },
  ListArea: {
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: 14,
  },
  ListContent: { paddingBottom: 24 },
  EmptyListContent: { flexGrow: 1 },
  CenteredArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  InfoText: { fontSize: 15, textAlign: "center", marginTop: 12 },
  RetryButton: {
    minHeight: 48,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    justifyContent: "center",
  },
  RetryButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  InlineError: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  InlineErrorText: { flex: 1, fontSize: 12, marginLeft: 7 },
  Attribution: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  AttributionText: {
    fontSize: 11,
    textDecorationLine: "underline",
  },
});
