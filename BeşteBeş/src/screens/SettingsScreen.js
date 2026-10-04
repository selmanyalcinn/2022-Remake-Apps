import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../components/Header.js";
import { AlertModal } from "../components/AlertModal.js";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { useFeedback } from "../hooks/useFeedback.js";
import { clearAllGameData } from "../utils/storage.js";
import { radius, spacing } from "../theme/spacing.js";

export const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, setThemeMode } = useTheme();
  const { language, setLanguage, hapticsEnabled, setHapticsEnabled, t } = usePreferences();
  const { tap, success, error } = useFeedback();
  const [alertType, setAlertType] = useState(/** @type {string | null} */ (null));
  const [resetting, setResetting] = useState(false);

  const resetGameData = async () => {
    if (resetting) return;

    setResetting(true);
    try {
      const cleared = await clearAllGameData();
      if (cleared) {
        success();
        setAlertType("complete");
      } else {
        error();
        setAlertType("error");
      }
    } finally {
      setResetting(false);
    }
  };

  const changeLanguage = (value) => {
    tap();
    setLanguage(value);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Header title={t("settings").toUpperCase()} onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
      >
        <Section title={t("appearance")} theme={theme}>
          <SettingRow icon="moon-outline" label={t("darkTheme")} theme={theme}>
            <Switch value={isDark} onValueChange={setThemeMode} trackColor={{ false: theme.surfaceBorder, true: theme.correct }} thumbColor="#FFFFFF" />
          </SettingRow>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{t("language")}</Text>
          <View style={styles.segmented}>
            <LanguageButton label={t("turkish")} selected={language === "tr"} onPress={() => changeLanguage("tr")} theme={theme} />
            <LanguageButton label={t("english")} selected={language === "en"} onPress={() => changeLanguage("en")} theme={theme} />
          </View>
        </Section>

        <Section title={t("feedback")} theme={theme}>
          <SettingRow icon="phone-portrait-outline" label={t("haptics")} theme={theme} last>
            <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} trackColor={{ false: theme.surfaceBorder, true: theme.correct }} thumbColor="#FFFFFF" />
          </SettingRow>
        </Section>

        <Section title={t("legal")} theme={theme}>
          <LinkRow icon="shield-checkmark-outline" label={t("privacyPolicy")} onPress={() => navigation.navigate("Legal", { type: "privacy" })} theme={theme} />
          <LinkRow icon="document-text-outline" label={t("termsOfUse")} onPress={() => navigation.navigate("Legal", { type: "terms" })} theme={theme} />
          <LinkRow icon="trash-outline" label={t("dataReset")} onPress={() => setAlertType("confirm")} theme={theme} destructive last />
        </Section>
      </ScrollView>

      <AlertModal
        visible={alertType !== null}
        title={alertType === "confirm" ? t("dataResetTitle") : t("dataReset")}
        message={alertType === "confirm" ? t("dataResetMessage") : alertType === "error" ? t("resetFailed") : t("resetComplete")}
        confirmLabel={alertType === "confirm" ? (resetting ? "…" : t("reset")) : t("ok")}
        cancelLabel={alertType === "confirm" ? t("cancel") : null}
        destructive={alertType === "confirm"}
        success={alertType === "complete"}
        confirmDisabled={resetting}
        onCancel={() => setAlertType(null)}
        onConfirm={alertType === "confirm" ? resetGameData : () => setAlertType(null)}
      />
    </View>
  );
};

const Section = ({ title, children, theme }) => (
  <View style={styles.sectionWrap}>
    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
    <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>{children}</View>
  </View>
);

const SettingRow = ({ icon, label, children, theme, last = false }) => (
  <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.surfaceBorder }]}>
    <View style={styles.rowLabel}>
      <Ionicons name={icon} size={21} color={theme.textPrimary} />
      <Text style={[styles.rowText, { color: theme.textPrimary }]}>{label}</Text>
    </View>
    {children}
  </View>
);

const LinkRow = ({ icon, label, onPress, theme, destructive = false, last = false }) => {
  const color = destructive ? theme.danger : theme.textPrimary;
  return (
    <TouchableOpacity
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.surfaceBorder }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowLabel}>
        <Ionicons name={icon} size={21} color={color} />
        <Text style={[styles.rowText, { color }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );
};

const LanguageButton = ({ label, selected, onPress, theme }) => (
  <TouchableOpacity
    style={[styles.languageButton, { backgroundColor: selected ? theme.correct : theme.surfaceLight, borderColor: selected ? theme.correct : theme.surfaceBorder }]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <Text style={[styles.languageText, { color: selected ? "#FFFFFF" : theme.textPrimary }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: spacing.lg },
  sectionWrap: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 13, fontWeight: "800", letterSpacing: 1.2, marginBottom: spacing.sm, marginLeft: spacing.xs },
  section: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden", paddingHorizontal: spacing.lg },
  row: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  rowLabel: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  rowText: { fontSize: 15, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "700", marginTop: spacing.md, marginBottom: spacing.sm },
  segmented: { flexDirection: "row", gap: spacing.sm, paddingBottom: spacing.lg },
  languageButton: { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: spacing.md, alignItems: "center" },
  languageText: { fontSize: 14, fontWeight: "800" },
});
