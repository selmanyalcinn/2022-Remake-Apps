import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../Context/AppContext";
import { CURRENCIES } from "../Utils/theme";

const THEME_OPTIONS = [
  { id: "light", labelKey: "themeLight", icon: "sunny-outline" },
  { id: "dark", labelKey: "themeDark", icon: "moon-outline" },
  { id: "system", labelKey: "themeSystem", icon: "phone-portrait-outline" },
];

function SectionHeading({ children, theme }) {
  return (
    <Text style={[styles.SectionHeading, { color: theme.subtext }]}>
      {children}
    </Text>
  );
}

function ThemeOption({ option, selected, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.ThemeOption,
        {
          backgroundColor: selected ? theme.accentLight : theme.card,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View
        style={[
          styles.ThemeIcon,
          { backgroundColor: selected ? theme.accent : theme.searchBg },
        ]}
      >
        <Ionicons
          name={option.icon}
          size={19}
          color={selected ? "#FFFFFF" : theme.subtext}
        />
      </View>
      <Text
        style={[
          styles.ThemeOptionText,
          { color: selected ? theme.accent : theme.text },
        ]}
      >
        {option.labelKey}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={19} color={theme.accent} />
      )}
    </TouchableOpacity>
  );
}

function LanguageOption({ label, selected, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.LanguageOption,
        {
          backgroundColor: selected ? theme.accentLight : theme.card,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.LanguageLabel, { color: theme.text }]}>{label}</Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={21} color={theme.accent} />
      )}
    </TouchableOpacity>
  );
}

function CurrencyOption({ currency, selected, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.LanguageOption,
        {
          backgroundColor: selected ? theme.accentLight : theme.card,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.CurrencyIdentity}>
        <Text
          style={[
            styles.CurrencySymbol,
            { color: selected ? theme.accent : theme.subtext },
          ]}
        >
          {currency.symbol}
        </Text>
        <Text style={[styles.LanguageLabel, { color: theme.text }]}>
          {currency.label}
        </Text>
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={21} color={theme.accent} />
      )}
    </TouchableOpacity>
  );
}

export default function Settings({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    theme,
    isDark,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    currency,
    selectCurrency,
    t,
  } = useApp();

  return (
    <View style={[styles.Container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={[
          styles.Header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: theme.header,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.BackButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t("back")}
        >
          <Ionicons name="arrow-back" size={23} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.HeaderTitle, { color: theme.text }]}>
          {t("settingsTitle")}
        </Text>
        <View style={styles.BackButton} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.Content,
          { paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        
        <SectionHeading theme={theme}>{t("appearance")}</SectionHeading>
        <View style={styles.ThemeGrid}>
          {THEME_OPTIONS.map((option) => (
            <ThemeOption
              key={option.id}
              option={{ ...option, labelKey: t(option.labelKey) }}
              selected={themeMode === option.id}
              onPress={() => setThemeMode(option.id)}
              theme={theme}
            />
          ))}
        </View>

        <SectionHeading theme={theme}>{t("language")}</SectionHeading>
        <View style={styles.Group}>
          <LanguageOption
            label={t("english")}
            selected={language === "en"}
            onPress={() => setLanguage("en")}
            theme={theme}
          />
          <LanguageOption
            label={t("turkish")}
            selected={language === "tr"}
            onPress={() => setLanguage("tr")}
            theme={theme}
          />
        </View>

        <SectionHeading theme={theme}>{t("currency")}</SectionHeading>
        <View style={[styles.Group, { marginBottom: 26 }]}>
          {CURRENCIES.map((option) => (
            <CurrencyOption
              key={option.code}
              currency={option}
              selected={currency.code === option.code}
              onPress={() => selectCurrency(option.code)}
              theme={theme}
            />
          ))}
        </View>

        <View
          style={[
            styles.InfoCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.InfoRow}>
            <View style={[styles.RowIcon, { backgroundColor: theme.searchBg }]}>
              <Ionicons name="server-outline" size={19} color={theme.subtext} />
            </View>
            <View style={styles.InfoContent}>
              <Text style={[styles.RowCaption, { color: theme.subtext }]}>
                {t("dataSource")}
              </Text>
              <Text style={[styles.InfoValue, { color: theme.text }]}>
                CoinGecko
              </Text>
              <Text style={[styles.RowCaption, { color: theme.subtext }]}>
                {t("financialDisclaimer")}
              </Text>
            </View>
          </View>
          <View
            style={[styles.InfoDivider, { backgroundColor: theme.border }]}
          />
          <View style={styles.InfoRow}>
            <View style={[styles.RowIcon, { backgroundColor: theme.searchBg }]}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={theme.subtext}
              />
            </View>
            <View style={styles.InfoContent}>
              <Text style={[styles.RowCaption, { color: theme.subtext }]}>
                {t("version")}
              </Text>
              <Text style={[styles.InfoValue, { color: theme.text }]}>
                2.0.1
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: { flex: 1 },
  Header: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  BackButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  HeaderTitle: { fontSize: 17, fontWeight: "700" },
  Content: { paddingHorizontal: 18, paddingTop: 25 },
  PageTitle: { fontSize: 30, fontWeight: "800", letterSpacing: -0.6 },
  PageSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 5,
    marginBottom: 26,
  },
  SectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  ThemeGrid: { flexDirection: "row", gap: 8, marginBottom: 26 },
  ThemeOption: {
    flex: 1,
    minHeight: 104,
    borderRadius: 16,
    borderWidth: 1,
    padding: 11,
    justifyContent: "space-between",
  },
  ThemeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ThemeOptionText: { fontSize: 13, fontWeight: "700" },
  Group: { gap: 9, marginBottom: 26 },
  LanguageOption: {
    minHeight: 56,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  LanguageLabel: { fontSize: 15, fontWeight: "600" },
  CurrencyIdentity: { flexDirection: "row", alignItems: "center", gap: 12 },
  CurrencySymbol: {
    width: 24,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  RowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  RowCaption: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  InfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 26,
  },
  InfoContent: { flex: 1, paddingVertical: 12 },
  InfoRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  InfoDivider: { height: StyleSheet.hairlineWidth, marginLeft: 49 },
  InfoValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
});
