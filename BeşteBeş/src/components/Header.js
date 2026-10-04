import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { radius, spacing } from "../theme/spacing.js";

export const Header = ({ title, subtitle = null, onBackPress, rightSlot = null }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
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
        onPress={onBackPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("back")}
      >
        <Ionicons name="arrow-back" size={26} color={theme.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.title, { color: theme.textPrimary }]}>
          {title || t("appName")}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSlot}>{rightSlot}</View>
    </View>
  );
};

export const HeaderIconButton = ({ icon, label, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[styles.iconButton, { backgroundColor: theme.surfaceLight }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={theme.textPrimary} />
    </TouchableOpacity>
  );
};

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
  titleContainer: { flex: 1, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "900", letterSpacing: 2.2, maxWidth: "100%" },
  subtitle: { fontSize: 13, fontWeight: "700", letterSpacing: 1.2, marginTop: -1 },
  rightSlot: {
    width: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
