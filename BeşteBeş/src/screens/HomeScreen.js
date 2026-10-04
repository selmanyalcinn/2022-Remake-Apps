import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HelpModal } from "../components/HelpModal.js";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { useDailyCountdown } from "../hooks/useDailyCountdown.js";
import { getStats, getDailyState, getUnlimitedState } from "../utils/storage.js";
import { getDailyWordForDate } from "../utils/wordList.js";
import { radius, spacing } from "../theme/spacing.js";

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = usePreferences();
  const { now, timeRemaining } = useDailyCountdown();
  const dailyInfo = getDailyWordForDate(now);
  const [helpVisible, setHelpVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [hasSavedUnlimited, setHasSavedUnlimited] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        getStats(),
        getDailyState(dailyInfo.dateStr),
        getUnlimitedState(),
      ]).then(([nextStats, daily, unlimited]) => {
        if (!active) return;
        setStats(nextStats);
        setDailyCompleted(Boolean(daily?.completed));
        setHasSavedUnlimited(Boolean(unlimited && !unlimited.completed));
      });
      return () => {
        active = false;
      };
    }, [dailyInfo.dateStr])
  );

  const played = stats?.played || 0;
  const winRate = played > 0 ? Math.round(((stats?.won || 0) / played) * 100) : 0;
  const statItems = [
    { label: t("played"), value: played },
    { label: t("winRate"), value: `%${winRate}` },
    { label: t("cups"), value: stats?.cups || 0 },
  ];
  const distribution = stats?.guessDistribution || {};
  const maxDistCount = Math.max(1, ...Object.values(distribution));

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.headerBg,
            borderBottomColor: theme.headerBorder,
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
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

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.statsCard, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}
        >
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
              const count = distribution[num] || 0;
              const width = Math.max(9, Math.round((count / maxDistCount) * 82));
              return (
                <View key={num} style={styles.distRow}>
                  <Text style={[styles.distNum, { color: theme.textPrimary }]}>{num}</Text>
                  <View
                    style={[styles.distBar, { width: `${width}%`, backgroundColor: count ? theme.correct : theme.absent }]}
                  >
                    <Text style={styles.distBarText}>{count}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.modeHeading, { color: theme.textSecondary }]}>{t("selectGameMode")}</Text>
        <View style={styles.modeList}>
          <ModeCard
            icon="calendar-outline"
            accent={theme.present}
            title={t("dailyChallenge")}
            description={dailyCompleted ? t("dailyCompleted") : t("dailyDescription")}
            detail={t("nextPuzzle", { time: timeRemaining })}
            onPress={() => navigation.navigate("WordleGame", { mode: "daily" })}
            theme={theme}
          />
          <ModeCard
            icon="infinite-outline"
            accent={theme.correct}
            title={t("unlimitedMode")}
            description={hasSavedUnlimited ? t("continueGame") : t("unlimitedDescription")}
            onPress={() => navigation.navigate("WordleGame", { mode: "unlimited" })}
            theme={theme}
          />
        </View>
      </ScrollView>

      <HelpModal visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </View>
  );
};

const IconButton = ({ icon, label, onPress, theme }) => (
  <TouchableOpacity
    style={[styles.iconButton, { backgroundColor: theme.surfaceLight }]}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Ionicons name={icon} size={21} color={theme.textPrimary} />
  </TouchableOpacity>
);

const ModeCard = ({ icon, accent, title, description, detail = null, onPress, theme }) => (
  <TouchableOpacity
    style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: accent }]}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <View style={styles.modeCardLeft}>
      <View style={[styles.iconCircle, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={icon === "infinite-outline" ? 26 : 24} color="#FFFFFF" />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>{description}</Text>
        {detail ? <Text style={[styles.countdown, { color: theme.textMuted }]}>{detail}</Text> : null}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={22} color={accent} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1 },
  appTitle: { fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  appSubtitle: { fontSize: 13, fontWeight: "800", letterSpacing: 1.2, marginTop: -2 },
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 7 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", padding: spacing.lg },
  statsCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, marginBottom: spacing.xl },
  statsHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  statsGrid: { flexDirection: "row", marginBottom: spacing.lg },
  statBox: { width: "33.333%", alignItems: "center", paddingVertical: spacing.sm },
  statValue: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 13, fontWeight: "600", marginTop: 2, textAlign: "center" },
  distTitle: { fontSize: 13, fontWeight: "700", marginBottom: spacing.sm },
  distContainer: { width: "100%", gap: 4 },
  distRow: { flexDirection: "row", alignItems: "center", height: 20 },
  distNum: { width: 16, fontSize: 13, fontWeight: "700", marginRight: 4 },
  distBar: { height: "100%", borderRadius: 2, justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 6 },
  distBarText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  modeHeading: { fontSize: 13, fontWeight: "700", letterSpacing: 1.3, marginBottom: spacing.sm, marginLeft: 2 },
  modeList: { width: "100%", gap: spacing.md },
  modeCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1.5, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  modeCardLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1 },
  modeTitle: { fontSize: 17, fontWeight: "800" },
  modeDescription: { fontSize: 14, marginTop: 2 },
  countdown: { fontSize: 13, marginTop: 4, fontVariant: ["tabular-nums"] },
});
