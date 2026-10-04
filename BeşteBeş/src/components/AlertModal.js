import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext.js";
import { radius, spacing } from "../theme/spacing.js";

export const AlertModal = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
  success = false,
  confirmDisabled = false,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const accent = destructive ? theme.danger : theme.correct;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel} statusBarTranslucent>
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
          <View style={[styles.iconWrap, { backgroundColor: `${accent}1F` }]}>
            <Ionicons
              name={success ? "checkmark-circle-outline" : destructive ? "warning-outline" : "information-circle-outline"}
              size={28}
              color={accent}
            />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          <View style={styles.actions}>
            {cancelLabel ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}
                onPress={onCancel}
                accessibilityRole="button"
              >
                <Text style={[styles.buttonText, { color: theme.textPrimary }]}>{cancelLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: accent, borderColor: accent }, confirmDisabled && styles.disabledButton]}
              onPress={onConfirm}
              disabled={confirmDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: confirmDisabled }}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  card: { width: "100%", maxWidth: 420, alignItems: "center", borderWidth: 1, borderRadius: radius.xl, padding: spacing.xxl, elevation: 8, shadowColor: "#000000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 12 },
  iconWrap: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: radius.full, marginBottom: spacing.lg },
  title: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  message: { fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  actions: { width: "100%", flexDirection: "row", gap: spacing.sm },
  button: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md },
  buttonText: { fontSize: 14, fontWeight: "800" },
  confirmText: { color: "#FFFFFF" },
  disabledButton: { opacity: 0.6 },
});
