import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function Scanned({ route, navigation }) {
  const data = route.params?.data || "";
  const insets = useSafeAreaInsets();

  const handleOpenLink = async () => {
    if (!data) return;

    let targetUrl = data.trim();
    if (
      !targetUrl.toLowerCase().startsWith("http://") &&
      !targetUrl.toLowerCase().startsWith("https://")
    ) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        Alert.alert(
          "Invalid Link",
          "This content could not be opened as a web link:\n" + data,
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not open link: " + error.message);
    }
  };

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({
        message: data,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const trimmedData = data.trim();
  const lowerData = trimmedData.toLowerCase();
  const isUrl =
    lowerData.startsWith("http://") ||
    lowerData.startsWith("https://") ||
    lowerData.startsWith("www.") ||
    (lowerData.includes(".") &&
      !lowerData.includes(" ") &&
      lowerData.length > 4);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top + 8, 44) }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Scan Result</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Icon & Badge */}
        <View style={styles.iconCard}>
          <View style={styles.iconCircle}>
            <MaterialIcons
              name={isUrl ? "language" : "qr-code-scanner"}
              size={64}
              color="#59c639"
            />
          </View>
          <Text style={styles.badgeText}>
            {isUrl ? "Web Link" : "Text Content"}
          </Text>
        </View>

        {/* Data Box */}
        <View style={styles.resultCard}>
          <Text style={styles.label}>Content</Text>
          <Text style={styles.dataText} selectable>
            {data}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 20, 20) },
        ]}
      >
        {isUrl && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleOpenLink}
          >
            <Ionicons
              name="open-outline"
              size={20}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Open in Browser</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="scan-outline"
            size={20}
            color="#f1f5f9"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.secondaryButtonText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f17",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#ffffff",
  },
  shareButton: {
    padding: 6,
  },
  contentContainer: {
    padding: 24,
    alignItems: "center",
  },
  iconCard: {
    alignItems: "center",
    marginVertical: 18,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(89, 198, 57, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(89, 198, 57, 0.35)",
  },
  badgeText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#4ade80",
  },
  resultCard: {
    width: "100%",
    backgroundColor: "#161f30",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#24324a",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dataText: {
    fontSize: 16,
    color: "#f8fafc",
    lineHeight: 24,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  button: {
    flexDirection: "row",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#59c639",
  },
  secondaryButton: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 0,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "600",
  },
});
