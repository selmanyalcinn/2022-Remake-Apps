import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { usePreferences } from "../src/context/PreferencesContext";
import Nav from "../Components/Nav";
import HelpModal from "../Components/HelpModal";
import { getTodayDateString } from "../Functions/Generate";
import { spacing, radius } from "../src/theme/index";

const KEYS = {
  games: "GamesPlayed",
  wins: "GamesWon",
  losses: "GamesLost",
  cups: "Cups",
  currentStreak: "CurrentStreak",
  maxStreak: "MaxStreak",
  dist: "GuessDistribution",
};

const EMPTY_DISTRIBUTION = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

async function loadStats() {
  const entries = await AsyncStorage.multiGet(Object.values(KEYS));
  const stored = Object.fromEntries(entries);
  const defaults = {
    [KEYS.games]: "0",
    [KEYS.wins]: "0",
    [KEYS.losses]: "0",
    [KEYS.cups]: "0",
    [KEYS.currentStreak]: "0",
    [KEYS.maxStreak]: "0",
    [KEYS.dist]: JSON.stringify(EMPTY_DISTRIBUTION),
  };
  const missing = Object.entries(defaults).filter(([key]) => stored[key] == null);
  if (missing.length) await AsyncStorage.multiSet(missing);
  const values = { ...defaults, ...stored };

  let dist = EMPTY_DISTRIBUTION;
  try {
    dist = { ...EMPTY_DISTRIBUTION, ...JSON.parse(values[KEYS.dist]) };
  } catch {
    await AsyncStorage.setItem(KEYS.dist, JSON.stringify(EMPTY_DISTRIBUTION));
  }

  return {
    games: Number.parseInt(values[KEYS.games], 10) || 0,
    wins: Number.parseInt(values[KEYS.wins], 10) || 0,
    losses: Number.parseInt(values[KEYS.losses], 10) || 0,
    cups: Number.parseInt(values[KEYS.cups], 10) || 0,
    currentStreak: Number.parseInt(values[KEYS.currentStreak], 10) || 0,
    maxStreak: Number.parseInt(values[KEYS.maxStreak], 10) || 0,
    dailyCompleted: (await AsyncStorage.getItem(`DailyCompleted_${getTodayDateString()}`)) === "true",
    dist,
  };
}

const INITIAL_STATS = {
  games: 0,
  wins: 0,
  losses: 0,
  cups: 0,
  currentStreak: 0,
  maxStreak: 0,
  dailyCompleted: false,
  dist: EMPTY_DISTRIBUTION,
};

export default function Home() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = usePreferences();
  const [helpVisible, setHelpVisible] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadStats()
        .then((next) => active && setStats(next))
        .catch(() => active && setStats(INITIAL_STATS));
      return () => {
        active = false;
      };
    }, [])
  );

  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  const statItems = [
    { label: t("played"), value: stats.games },
    { label: t("winRate"), value: `%${winRate}` },
    { label: t("cups"), value: stats.cups },
  ];
  const maxDistCount = Math.max(1, ...Object.values(stats.dist));

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder, paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}>{t("appName")}</Text>
          <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>{t("appSubtitle")}</Text>
        </View>
        <View style={styles.topBarActions}>
          <IconButton icon={isDark ? "sunny-outline" : "moon-outline"} label={t("darkTheme")} onPress={toggleTheme} theme={theme} />
          <IconButton icon="help-circle-outline" label={t("howToPlay")} onPress={() => setHelpVisible(true)} theme={theme} />
          <IconButton icon="settings-outline" label={t("settings")} onPress={() => navigation.navigate("Settings")} theme={theme} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxxl }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.statsCard, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}>
          <View style={styles.statsHeader}>
            <Ionicons name="bar-chart-outline" size={18} color={theme.textPrimary} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t("statistics")}</Text>
          </View>
          <View style={styles.statsGrid}>
            {statItems.map((item) => (
              <View key={item.label} style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{item.label}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.distTitle, { color: theme.textPrimary }]}>{t("guessDistribution")}</Text>
          <View style={styles.distContainer}>
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = stats.dist[num] || 0;
              const width = Math.max(9, Math.round((count / maxDistCount) * 82));
              return (
                <View key={num} style={styles.distRow}>
                  <Text style={[styles.distNum, { color: theme.textPrimary }]}>{num}</Text>
                  <View style={[styles.distBar, { width: `${width}%`, backgroundColor: count ? theme.correct : theme.absent }]}>
                    <Text style={styles.distBarText}>{count}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.modeHeading, { color: theme.textSecondary }]}>{t("selectGameMode")}</Text>
        <Nav theme={theme} dailyCompleted={stats.dailyCompleted} />
      </ScrollView>

      <HelpModal visible={helpVisible} onClose={() => setHelpVisible(false)} theme={theme} />
    </View>
  );
}

function IconButton({ icon, label, onPress, theme }) {
  return (
    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surfaceLight }]} onPress={onPress} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={21} color={theme.textPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1 },
  appTitle: { fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  appSubtitle: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginTop: -2 },
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 7 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", padding: spacing.lg },
  statsCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, marginBottom: spacing.xl },
  statsHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg },
  statBox: { width: "33.333%", alignItems: "center", paddingVertical: spacing.sm },
  statValue: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2, textAlign: "center" },
  distTitle: { fontSize: 13, fontWeight: "700", marginBottom: spacing.sm },
  distContainer: { width: "100%", gap: 4 },
  distRow: { flexDirection: "row", alignItems: "center", height: 20 },
  distNum: { width: 14, fontSize: 12, fontWeight: "700", marginRight: 4 },
  distBar: { height: "100%", borderRadius: 2, justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 6 },
  distBarText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  modeHeading: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: spacing.sm, marginLeft: 2 },
});
