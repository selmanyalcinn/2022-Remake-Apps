import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreferences } from "../src/context/PreferencesContext";
import { spacing, radius } from "../src/theme/index";

/**
 * Header — top bar for game screens.
 *
 * Props:
 *   title       — screen title string (default: "MATHER")
 *   subtitle    — subtitle string (default: "MATH WORDLE")
 *   theme       — color palette
 *   rightSlot   — optional JSX for right side (e.g. dark mode toggle)
 */
export default function Header({
  title = "MATHER",
  subtitle = "MATH WORDLE",
  theme,
  rightSlot = null,
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = usePreferences();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.headerBorder,
          paddingTop: insets.top + spacing.sm,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
        }
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("back")}
      >
        <Ionicons name="arrow-back" size={26} color={theme.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSlot}>{rightSlot ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 76,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2.5,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: -1,
  },
  rightSlot: {
    minWidth: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
});
