import { View, StyleSheet } from "react-native";

/**
 * İnce ayırıcı çizgi.
 * @param {string} color - Çizgi rengi (varsayılan: açık tema border rengi)
 */
export default function Divider({ color = "#E2E8F0" }) {
  return <View style={[styles.line, { borderBottomColor: color }]} />;
}

const styles = StyleSheet.create({
  line: {
    borderBottomWidth: 1,
    marginVertical: 6,
  },
});
