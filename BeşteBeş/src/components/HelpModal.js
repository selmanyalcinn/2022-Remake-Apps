import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext.js";
import { usePreferences } from "../context/PreferencesContext.js";
import { radius, spacing } from "../theme/spacing.js";

const EXAMPLES = [
  { key: "correctSpot", value: "K", status: "correct" },
  { key: "wrongSpot", value: "İ", status: "present" },
  { key: "notPresent", value: "A", status: "absent" },
];

export const HelpModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = usePreferences();
  const colorFor = (status) =>
    status === "correct" ? theme.correct : status === "present" ? theme.present : theme.absent;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.modalOverlay,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View accessibilityViewIsModal style={[styles.card, { backgroundColor: theme.modalBg, borderColor: theme.surfaceBorder }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{t("howToPlay")}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.close, { backgroundColor: theme.surfaceLight }]}
              accessibilityRole="button"
              accessibilityLabel={t("cancel")}
            >
              <Ionicons name="close" size={21} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.intro, { color: theme.textSecondary }]}>{t("helpIntro")}</Text>
            {["ruleLength", "ruleFeedback"].map((key) => (
              <View key={key} style={styles.rule}>
                <Ionicons name="checkmark-circle" size={18} color={theme.correct} />
                <Text style={[styles.ruleText, { color: theme.textSecondary }]}>{t(key)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
            {EXAMPLES.map((example) => (
              <View key={example.key} style={styles.example}>
                <View style={[styles.exampleCell, { backgroundColor: colorFor(example.status) }]}>
                  <Text style={styles.exampleValue}>{example.value}</Text>
                </View>
                <Text style={[styles.exampleText, { color: theme.textSecondary }]}>{t(example.key)}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.primary, { backgroundColor: theme.correct }]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>{t("gotIt")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  card: { width: "100%", maxWidth: 560, maxHeight: "92%", alignSelf: "center", borderRadius: radius.xl, borderWidth: 1, padding: spacing.xl },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  title: { fontSize: 21, fontWeight: "900" },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: spacing.sm },
  intro: { fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  rule: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.md },
  ruleText: { flex: 1, fontSize: 14, lineHeight: 20 },
  divider: { height: 1, marginVertical: spacing.md },
  example: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  exampleCell: { width: 42, height: 42, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  exampleValue: { color: "#FFFFFF", fontSize: 21, fontWeight: "900" },
  exampleText: { flex: 1, fontSize: 14, lineHeight: 20 },
  primary: { marginTop: spacing.lg, paddingVertical: spacing.md + 2, borderRadius: radius.md, alignItems: "center" },
  primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
