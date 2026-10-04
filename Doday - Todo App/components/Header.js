import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import { triggerHaptic } from "../utils/haptics";

export default function Header({
  totalTasks,
  completedTasks,
  totalAllCompleted = 0,
  onClearCompleted,
}) {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getFormattedDate = () => {
    const today = new Date();
    const options = { weekday: "long", day: "numeric", month: "long" };
    return today.toLocaleDateString("en-US", options);
  };

  const handleClear = () => {
    triggerHaptic("warning");
    onClearCompleted();
  };

  return (
    <View style={styles.headerWrapper}>
      {/* Header Banner */}
      <View style={styles.yellowHeader}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
            <Text style={styles.greetingText}>doday</Text>
          </View>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.black}
              />
              <Text style={styles.badgeText}>
                {completedTasks}/{totalTasks}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCardContainer}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{"Today's Progress"}</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressSubtext}>
              {totalTasks === 0
                ? "No tasks for today"
                : completedTasks === totalTasks
                  ? "All today's tasks completed! 🎉"
                  : `${totalTasks - completedTasks} task${totalTasks - completedTasks === 1 ? "" : "s"} remaining`}
            </Text>
            {(completedTasks > 0 || totalAllCompleted > 0) && (
              <TouchableOpacity
                onPress={handleClear}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Clear all completed tasks"
              >
                <Text style={styles.clearText}>Clear Completed</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    marginBottom: 16,
  },
  yellowHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#27272A",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.black,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.black,
    marginLeft: 5,
  },
  progressCardContainer: {
    paddingHorizontal: 20,
    marginTop: -14,
  },
  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textHeading,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  clearText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: "700",
  },
});
