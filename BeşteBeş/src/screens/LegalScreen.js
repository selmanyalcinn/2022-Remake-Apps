import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../components/Header.js";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { radius, spacing } from "../theme/spacing.js";

export const LegalScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = usePreferences();
  const isPrivacy = route?.params?.type === "privacy";
  const title = t(isPrivacy ? "privacyPolicy" : "termsOfUse");
  const body = t(isPrivacy ? "privacyBody" : "termsBody");

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Header title={title.toUpperCase()} onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>{body}</Text>
          <Text style={[styles.updated, { color: theme.textMuted }]}>{t("lastUpdated")}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: spacing.lg },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: "900", marginBottom: spacing.lg },
  body: { fontSize: 15, lineHeight: 24 },
  updated: { fontSize: 13, marginTop: spacing.xxl },
});
