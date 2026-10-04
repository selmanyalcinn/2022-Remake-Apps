import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../Components/Header";
import AlertModal from "../Components/AlertModal";
import { useTheme } from "../src/context/ThemeContext";
import { usePreferences } from "../src/context/PreferencesContext";
import { clearGameData } from "../Functions/Stats";
import { radius, spacing } from "../src/theme";

export default function Settings() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, isDark, setThemeMode } = useTheme();
  const { language, setLanguage, hapticsEnabled, setHapticsEnabled, t } = usePreferences();
  const [alertType, setAlertType] = useState(null);

  const resetGameData = async () => {
    setAlertType(null);
    await clearGameData();
    setAlertType("complete");
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Header title={t("settings")} subtitle={null} theme={theme} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <Section title={t("appearance")} theme={theme}>
          <SettingRow icon="moon-outline" label={t("darkTheme")} theme={theme}>
            <Switch value={isDark} onValueChange={setThemeMode} trackColor={{ false: theme.surfaceBorder, true: theme.correct }} thumbColor="#FFFFFF" />
          </SettingRow>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{t("language")}</Text>
          <View style={styles.segmented}>
            <LanguageButton label={t("turkish")} selected={language === "tr"} onPress={() => setLanguage("tr")} theme={theme} />
            <LanguageButton label={t("english")} selected={language === "en"} onPress={() => setLanguage("en")} theme={theme} />
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
        message={alertType === "confirm" ? t("dataResetMessage") : t("resetComplete")}
        confirmLabel={alertType === "confirm" ? t("reset") : t("ok")}
        cancelLabel={alertType === "confirm" ? t("cancel") : null}
        destructive={alertType === "confirm"}
        onCancel={() => setAlertType(null)}
        onConfirm={alertType === "confirm" ? resetGameData : () => setAlertType(null)}
        theme={theme}
      />
    </View>
  );
}

function Section({ title, children, theme }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, label, children, theme, last = false }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.surfaceBorder }]}>
      <View style={styles.rowLabel}><Ionicons name={icon} size={21} color={theme.textPrimary} /><Text style={[styles.rowText, { color: theme.textPrimary }]}>{label}</Text></View>
      {children}
    </View>
  );
}

function LinkRow({ icon, label, onPress, theme, destructive = false, last = false }) {
  const color = destructive ? theme.danger : theme.textPrimary;
  return (
    <TouchableOpacity style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.surfaceBorder }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.rowLabel}><Ionicons name={icon} size={21} color={color} /><Text style={[styles.rowText, { color }]}>{label}</Text></View>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function LanguageButton({ label, selected, onPress, theme }) {
  return (
    <TouchableOpacity style={[styles.languageButton, { backgroundColor: selected ? theme.correct : theme.surfaceLight, borderColor: selected ? theme.correct : theme.surfaceBorder }]} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}>
      <Text style={[styles.languageText, { color: selected ? "#FFFFFF" : theme.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: spacing.lg },
  sectionWrap: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: spacing.sm, marginLeft: spacing.xs },
  section: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden", paddingHorizontal: spacing.lg },
  row: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  rowLabel: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  rowText: { fontSize: 15, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "700", marginTop: spacing.md, marginBottom: spacing.sm },
  segmented: { flexDirection: "row", gap: spacing.sm, paddingBottom: spacing.lg },
  languageButton: { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: spacing.md, alignItems: "center" },
  languageText: { fontSize: 14, fontWeight: "800" },
});
