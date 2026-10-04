import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { radius, spacing } from "../theme/spacing.js";

const KEYBOARD_ROWS = [
  ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
  ["Z", "C", "V", "B", "N", "M", "Ö", "Ç"],
];

export const Keyboard = ({ onKeyPress, keyStatuses = {}, disabled = false }) => {
  const { theme } = useTheme();
  const { t } = usePreferences();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 700 || width < 360;
  const keyHeight = compact ? 42 : Math.max(48, Math.min(56, Math.floor(width * 0.13)));

  const colorsFor = (key) => {
    const status = keyStatuses[key];
    if (status === "correct") return { backgroundColor: theme.correct, color: "#FFFFFF" };
    if (status === "present") return { backgroundColor: theme.present, color: "#FFFFFF" };
    if (status === "absent") return { backgroundColor: theme.absent, color: "#FFFFFF" };
    return { backgroundColor: theme.keyDefault, color: theme.keyText };
  };

  return (
    <View
      style={[
        styles.keyboard,
        {
          backgroundColor: theme.background,
          paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.sm,
          opacity: disabled ? 0.58 : 1,
        },
      ]}
    >
      {KEYBOARD_ROWS.map((row) => (
        <View key={row.join("")} style={styles.keyRow}>
          {row.map((key) => {
            const colors = colorsFor(key);
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onKeyPress(key)}
                disabled={disabled}
                activeOpacity={0.68}
                style={styles.keyWrapper}
                accessibilityRole="button"
                accessibilityLabel={key}
                accessibilityState={{ disabled }}
              >
                <View style={[styles.key, { height: keyHeight, backgroundColor: colors.backgroundColor, borderColor: theme.keyBorder }]}>
                  <Text style={[styles.keyText, { color: colors.color, fontSize: compact ? 14 : 16 }]}>{key}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      <View style={styles.actionRow}>
        <ActionButton icon="backspace-outline" label={t("delete")} onPress={() => onKeyPress("SİL")} disabled={disabled} height={keyHeight} theme={theme} />
        <ActionButton icon="return-down-back-outline" label={t("enter")} onPress={() => onKeyPress("ENTER")} disabled={disabled} height={keyHeight} theme={theme} />
      </View>
    </View>
  );
};

const ActionButton = ({ icon, label, onPress, disabled, height, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.68}
    style={[styles.actionButton, { height, backgroundColor: theme.keyDefault, borderColor: theme.keyBorder }]}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
  >
    <Ionicons name={icon} size={23} color={theme.keyText} />
    <Text style={[styles.actionText, { color: theme.keyText }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  keyboard: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  keyRow: { flexDirection: "row", justifyContent: "center", marginBottom: spacing.xs, gap: 4 },
  keyWrapper: { flex: 1, maxWidth: 58 },
  key: { borderRadius: radius.sm, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  keyText: { fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.sm, borderWidth: 1 },
  actionText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.4 },
});
