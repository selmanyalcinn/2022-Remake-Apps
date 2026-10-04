import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { spacing, radius } from "../src/theme/index";
import { usePreferences } from "../src/context/PreferencesContext";
import { useDailyCountdown } from "../src/hooks/useDailyCountdown";

/**
 * Nav — Mode selection cards on the Home screen.
 * Props:
 *   theme           — color palette
 *   dailyCompleted  — boolean indicating whether today's challenge was completed
 */
export default function Nav({ theme, dailyCompleted = false }) {
  const navigation = useNavigation();
  const { t } = usePreferences();
  const countdown = useDailyCountdown();

  return (
    <View style={styles.navContainer}>
      {/* 1. Daily Challenge */}
      <TouchableOpacity
        style={[
          styles.modeCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.present,
          },
        ]}
        onPress={() => navigation.navigate("Daily")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("dailyChallenge")}
      >
        <View style={styles.modeCardLeft}>
          <View style={[styles.iconCircle, { backgroundColor: theme.present }]}>
            <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>
              {t("dailyChallenge")}
            </Text>
            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>
              {dailyCompleted
                ? t("dailyCompleted")
                : t("dailyDescription")}
            </Text>
            <Text style={[styles.countdown, { color: theme.textMuted }]}>
              {t("nextPuzzle", { time: countdown })}
            </Text>
          </View>
        </View>
        <View style={styles.playArrow}>
          <Ionicons name="chevron-forward" size={22} color={theme.present} />
        </View>
      </TouchableOpacity>

      {/* 2. Random Game */}
      <TouchableOpacity
        style={[
          styles.modeCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.correct,
          },
        ]}
        onPress={() => navigation.navigate("Random Game")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("randomGame")}
      >
        <View style={styles.modeCardLeft}>
          <View style={[styles.iconCircle, { backgroundColor: theme.correct }]}>
            <Ionicons name="infinite-outline" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.modeTitle, { color: theme.textPrimary }]}>
              {t("randomGame")}
            </Text>
            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>
              {t("randomDescription")}
            </Text>
          </View>
        </View>
        <View style={styles.playArrow}>
          <Ionicons name="chevron-forward" size={22} color={theme.correct} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    width: "100%",
    gap: spacing.md,
  },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  modeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  modeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  countdown: {
    fontSize: 11,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  playArrow: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
