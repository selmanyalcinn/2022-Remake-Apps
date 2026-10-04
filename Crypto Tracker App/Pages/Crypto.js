import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LineChart } from "react-native-gifted-charts";
import Ionicons from "@expo/vector-icons/Ionicons";
import Divider from "../Components/Divider";
import {
  formatLargeNumber,
  formatPrice,
  getChangeColor,
} from "../Utils/helpers";
import { getCachedChart, getCoinChart } from "../Services/cryptoService";
import { useApp } from "../Context/AppContext";

const PERIODS = [
  { labelKey: "day", days: 1 },
  { labelKey: "sevenDaysShort", days: 7 },
  { labelKey: "month", days: 30 },
  { labelKey: "quarter", days: 90 },
  { labelKey: "year", days: 365 },
];

const formatYAxis = (value) => {
  if (!Number.isFinite(value)) return "";
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  if (value >= 1) return value.toFixed(0);
  if (value >= 0.01) return value.toFixed(3);
  return value.toFixed(6);
};

function downsamplePoints(data, maxPoints = 45) {
  if (!Array.isArray(data) || data.length <= maxPoints) return data || [];

  const step = (data.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, index) =>
    data[Math.min(Math.round(index * step), data.length - 1)]
  );
}

const toChartData = (points) =>
  downsamplePoints(
    (points || [])
      .map((point) => ({ value: Number(point?.y) }))
      .filter((point) => Number.isFinite(point.value))
  );

function ChangePill({ label, value, theme }) {
  const hasValue = Number.isFinite(value);
  const isPositive = hasValue && value > 0;
  const isNegative = hasValue && value < 0;
  const color = getChangeColor(value, theme.subtext);

  return (
    <View style={styles.ChangeItem}>
      <Text style={[styles.ChangeLabel, { color: theme.subtext }]}>{label}</Text>
      <View
        style={[
          styles.Pill,
          {
            backgroundColor: isPositive
              ? theme.pillPosBg
              : isNegative
                ? theme.pillNegBg
                : theme.chipInactiveBg,
          },
        ]}
      >
        <Text style={[styles.PillText, { color }]}>
          {hasValue
            ? `${isPositive ? "▲" : isNegative ? "▼" : "•"} ${Math.abs(value).toFixed(2)}%`
            : "N/A"}
        </Text>
      </View>
    </View>
  );
}

function DetailRow({ label, value, theme }) {
  return (
    <>
      <View style={styles.DetailRowContainer}>
        <Text style={[styles.DetailLabel, { color: theme.subtext }]}>{label}</Text>
        <Text
          style={[styles.DetailValue, { color: theme.text }]}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
      <Divider color={theme.border} />
    </>
  );
}

export default function Crypto({ route, navigation }) {
  const { item } = route.params;
  const { theme, isDark, isFavorite, toggleFavorite, currency, t } = useApp();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(240, windowWidth - 40);

  const favorited = isFavorite(item.id);
  const change7d = item.price_change_percentage_7d_in_currency;
  const chartColor = getChangeColor(change7d, theme.subtext);

  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[1]);
  const [chartData, setChartData] = useState(() => {
    const cached = getCachedChart(item.id, 7, currency.code);
    return cached ? toChartData(cached) : [];
  });
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loadingTimer = useRef(null);
  const requestId = useRef(0);

  useEffect(() => {
    const cached = getCachedChart(item.id, 7, currency.code);
    if (cached?.length) {
      setChartData(toChartData(cached));
      return undefined;
    }

    const currentRequestId = ++requestId.current;
    setChartLoading(true);
    setChartError(null);

    getCoinChart(item.id, 7, currency.code)
      .then((raw) => {
        if (requestId.current === currentRequestId) {
          setChartData(toChartData(raw));
        }
      })
      .catch((error) => {
        if (requestId.current === currentRequestId) {
          setChartError(
            error?.status === 429
              ? "İstek limiti aşıldı. Biraz sonra tekrar deneyin."
              : t("chartError")
          );
        }
      })
      .finally(() => {
        if (requestId.current === currentRequestId) setChartLoading(false);
      });

    return undefined;
  }, [currency.code, item.id]);

  useEffect(
    () => () => {
      requestId.current += 1;
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
      fadeAnim.stopAnimation();
    },
    [fadeAnim]
  );

  const handlePeriodChange = useCallback(
    async (period) => {
      if (period.days === selectedPeriod.days) return;

      const previousPeriod = selectedPeriod;
      const currentRequestId = ++requestId.current;
      setSelectedPeriod(period);
      setChartError(null);

      const cached = getCachedChart(item.id, period.days, currency.code);
      if (cached?.length) {
        setChartData(toChartData(cached));
        setChartLoading(false);
        fadeAnim.setValue(1);
        return;
      }

      Animated.timing(fadeAnim, {
        toValue: 0.4,
        duration: 120,
        useNativeDriver: true,
      }).start();

      if (loadingTimer.current) clearTimeout(loadingTimer.current);
      loadingTimer.current = setTimeout(() => {
        if (requestId.current === currentRequestId) setChartLoading(true);
      }, 250);

      try {
        const raw = await getCoinChart(item.id, period.days, currency.code);
        if (requestId.current === currentRequestId) {
          setChartData(toChartData(raw));
        }
      } catch (error) {
        if (requestId.current === currentRequestId) {
          setSelectedPeriod(previousPeriod);
          setChartError(
            error?.status === 429
              ? "İstek limiti aşıldı. Biraz sonra tekrar deneyin."
              : t("chartError")
          );
        }
      } finally {
        if (requestId.current === currentRequestId) {
          if (loadingTimer.current) clearTimeout(loadingTimer.current);
          setChartLoading(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }).start();
        }
      }
    },
    [currency.code, fadeAnim, item.id, selectedPeriod]
  );

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Home");
  };

  return (
    <View style={[styles.Main, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={[
          styles.Header,
          { paddingTop: insets.top + 10, backgroundColor: theme.header },
        ]}
      >
        <TouchableOpacity
          style={styles.HeaderButton}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.CoinIdentity}>
          <Image style={styles.CoinLogo} source={{ uri: item.image }} />
          <Text style={[styles.CoinName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.CoinSymbol, { color: theme.subtext }]}>
            {item.symbol?.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.HeaderButton}
          accessibilityRole="button"
          accessibilityLabel={
            favorited ? t("removeFavorite", { name: item.name }) : t("addFavorite", { name: item.name })
          }
          accessibilityState={{ selected: favorited }}
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={24}
            color={favorited ? theme.favActive : theme.favInactive}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.ScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.ScrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 20 },
        ]}
      >
        <View style={styles.PriceSection}>
          <Text
            style={[styles.Price, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatPrice(item.current_price, currency.symbol)}
          </Text>
          {Number.isFinite(change7d) && (
            <View
              style={[
                styles.PricePill,
                {
                  backgroundColor:
                    change7d > 0
                      ? theme.pillPosBg
                      : change7d < 0
                        ? theme.pillNegBg
                        : theme.chipInactiveBg,
                },
              ]}
            >
              <Text style={[styles.PricePillText, { color: chartColor }]}>
                {change7d > 0 ? "▲" : change7d < 0 ? "▼" : "•"}{" "}
                {Math.abs(change7d).toFixed(2)}% ({t("sevenDaysShort")})
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.Card, { backgroundColor: theme.card }]}>
          <View style={styles.PeriodRow}>
            {PERIODS.map((period) => {
              const isActive = selectedPeriod.days === period.days;
              return (
                <TouchableOpacity
                  key={period.days}
                  onPress={() => handlePeriodChange(period)}
                  style={[
                    styles.PeriodBtn,
                    {
                      backgroundColor: isActive
                        ? theme.chipActiveBg
                        : theme.chipInactiveBg,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={t("chartPeriod", { period: t(period.labelKey) })}
                >
                  <Text
                    style={[
                      styles.PeriodBtnText,
                      {
                        color: isActive
                          ? theme.chipActiveText
                          : theme.chipInactiveText,
                        fontWeight: isActive ? "700" : "500",
                      },
                    ]}
                  >
                    {t(period.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.ChartContainerRelative}>
            {chartLoading && (
              <View
                style={[
                  styles.ChartOverlayLoader,
                  { backgroundColor: `${theme.card}E6` },
                ]}
              >
                <ActivityIndicator size="small" color={theme.activityIndicator} />
              </View>
            )}

            {chartData.length ? (
              <Animated.View style={[styles.ChartWrapper, { opacity: fadeAnim }]}>
                <LineChart
                  data={chartData}
                  width={chartWidth}
                  height={200}
                  color={chartColor}
                  areaChart
                  startFillColor={chartColor}
                  endFillColor={chartColor}
                  startOpacity={0.25}
                  endOpacity={0.02}
                  thickness={2}
                  hideDataPoints
                  noOfSections={4}
                  yAxisTextStyle={[styles.AxisLabel, { color: theme.subtext }]}
                  yAxisTextNumberOfLines={1}
                  formatYLabel={(value) => formatYAxis(Number(value))}
                  xAxisColor={theme.border}
                  yAxisColor="transparent"
                  rulesColor={theme.border}
                  rulesType="solid"
                  focusEnabled
                  showTextOnFocus
                  textFontSize={11}
                  textColor={chartColor}
                  curved
                  initialSpacing={0}
                  spacing={(chartWidth - 20) / Math.max(chartData.length - 1, 1)}
                />
              </Animated.View>
            ) : !chartLoading && !chartError ? (
              <View style={styles.EmptyChart}>
                <Text style={{ color: theme.subtext }}>{t("chartEmpty")}</Text>
              </View>
            ) : null}
          </View>
          {chartError && (
            <Text style={[styles.ChartError, { color: theme.error }]}>{chartError}</Text>
          )}
        </View>

        <View style={[styles.Card, { backgroundColor: theme.card }]}>
          <Text style={[styles.SectionTitle, { color: theme.text }]}>{t("priceChanges")}</Text>
          <Divider color={theme.border} />
          <View style={styles.ChangesGrid}>
            <ChangePill label={t("oneHour")} value={item.price_change_percentage_1h_in_currency} theme={theme} />
            <ChangePill label={t("twentyFourHours")} value={item.price_change_percentage_24h} theme={theme} />
            <ChangePill label={t("sevenDays")} value={item.price_change_percentage_7d_in_currency} theme={theme} />
            <ChangePill label={t("fourteenDays")} value={item.price_change_percentage_14d_in_currency} theme={theme} />
            <ChangePill label={t("thirtyDays")} value={item.price_change_percentage_30d_in_currency} theme={theme} />
            <ChangePill label={t("year")} value={item.price_change_percentage_1y_in_currency} theme={theme} />
          </View>
        </View>

        <View style={[styles.Card, { backgroundColor: theme.card }]}>
          <Text style={[styles.SectionTitle, { color: theme.text }]}>{t("marketDetails")}</Text>
          <Divider color={theme.border} />
          <DetailRow
            label={t("marketRank")}
            value={Number.isFinite(item.market_cap_rank) ? `#${item.market_cap_rank}` : "N/A"}
            theme={theme}
          />
          <DetailRow
            label={t("marketCap")}
            value={formatLargeNumber(item.market_cap, currency.symbol)}
            theme={theme}
          />
          <DetailRow
            label={t("volume")}
            value={formatLargeNumber(item.total_volume, currency.symbol)}
            theme={theme}
          />
          <DetailRow
            label={t("high24")}
            value={formatPrice(item.high_24h, currency.symbol)}
            theme={theme}
          />
          <DetailRow
            label={t("low24")}
            value={formatPrice(item.low_24h, currency.symbol)}
            theme={theme}
          />
          <DetailRow
            label={t("circulatingSupply")}
            value={formatLargeNumber(item.circulating_supply)}
            theme={theme}
          />
          <DetailRow
            label={t("totalSupply")}
            value={formatLargeNumber(item.total_supply)}
            theme={theme}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  Main: { flex: 1 },
  Header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 1,
  },
  HeaderButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  CoinIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  CoinLogo: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  CoinName: { fontSize: 18, fontWeight: "700", flexShrink: 1 },
  CoinSymbol: { fontSize: 13, fontWeight: "500", marginLeft: 5 },
  ScrollView: { flex: 1 },
  ScrollContent: { paddingHorizontal: 14, paddingTop: 14 },
  PriceSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical: 8,
    marginBottom: 12,
  },
  Price: { maxWidth: "100%", fontSize: 34, fontWeight: "700" },
  PricePill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 12,
    marginTop: 4,
  },
  PricePillText: { fontSize: 13, fontWeight: "600" },
  Card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  SectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  PeriodRow: { flexDirection: "row", marginHorizontal: -3, marginBottom: 12 },
  PeriodBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    marginHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  PeriodBtnText: { fontSize: 13 },
  ChartContainerRelative: { position: "relative", minHeight: 200 },
  ChartOverlayLoader: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -16,
    right: -16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 12,
  },
  ChartWrapper: { marginLeft: -16, marginRight: -16 },
  ChartError: { fontSize: 12, textAlign: "center", marginTop: 8 },
  EmptyChart: { height: 200, alignItems: "center", justifyContent: "center" },
  AxisLabel: { fontSize: 9 },
  ChangesGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  ChangeItem: { width: "33.33%", alignItems: "center", paddingVertical: 8 },
  ChangeLabel: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  Pill: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  PillText: { fontSize: 11, fontWeight: "600" },
  DetailRowContainer: {
    minHeight: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  DetailLabel: { flex: 1, fontSize: 14, marginRight: 12 },
  DetailValue: { maxWidth: "55%", fontSize: 14, fontWeight: "600", textAlign: "right" },
});
