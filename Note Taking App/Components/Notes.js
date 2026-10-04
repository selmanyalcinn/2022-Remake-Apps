import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Note({ title, text, date }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year}  ${hours}:${minutes}`;
  };

  return (
    <View style={styles.note}>
      <View style={styles.noteHeader}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="sticky-note" size={18} color="#1a1a1a" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {title}
          </Text>
          {date ? (
            <Text style={styles.noteDate}>{formatDate(date)}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.noteBody}>
        <Text style={styles.noteText} numberOfLines={3}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbdb04",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.2,
  },
  noteDate: {
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
    marginTop: 2,
    fontWeight: "500",
  },
  noteBody: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});
