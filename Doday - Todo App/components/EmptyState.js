import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { triggerHaptic } from "../utils/haptics";

export default function EmptyState({
  filterType,
  selectedCategory = "All",
  isSearching = false,
  hasAnyTask = false,
  onAddTask,
}) {
  const { width } = useWindowDimensions();
  const getDetails = () => {
    // 1. No Search Results
    if (isSearching) {
      return {
        icon: "search-outline",
        title: "No Results Found",
        subtitle: "No tasks matched your search criteria.",
        showButton: false,
      };
    }

    // 2. Selected Category is Empty
    if (
      selectedCategory &&
      selectedCategory !== "All" &&
      selectedCategory !== "Tümü"
    ) {
      return {
        icon: "folder-open-outline",
        title: `${selectedCategory} is Empty`,
        subtitle: `No tasks added under "${selectedCategory}" yet.`,
        showButton: !hasAnyTask,
      };
    }

    // 3. Status Filter Empty States
    switch (filterType) {
      case "active":
        return {
          icon: "sparkles",
          title: "All Caught Up!",
          subtitle:
            "You have completed all pending tasks, or you can add a new one.",
          showButton: false,
        };
      case "completed":
        return {
          icon: "checkmark-circle-outline",
          title: "No Completed Tasks Yet",
          subtitle: "Completed tasks will appear here as you check them off.",
          showButton: false,
        };
      default:
        return {
          icon: "clipboard-outline",
          title: "No Tasks Yet",
          subtitle:
            "Create a new task to organize your day and get things done!",
          showButton: !hasAnyTask,
        };
    }
  };

  const details = getDetails();

  const handleAdd = () => {
    triggerHaptic("medium");
    if (onAddTask) onAddTask();
  };

  return (
    <View style={[styles.container, width >= 600 && styles.tabletContainer]}>
      <View style={styles.iconCircle}>
        <Ionicons name={details.icon} size={44} color={COLORS.black} />
      </View>
      <Text style={styles.title}>{details.title}</Text>
      <Text style={styles.subtitle}>{details.subtitle}</Text>

      {details.showButton && onAddTask && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleAdd}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add new task"
        >
          <Ionicons name="add" size={20} color={COLORS.black} />
          <Text style={styles.buttonText}>Add New Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  tabletContainer: {
    justifyContent: "flex-start",
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
});
