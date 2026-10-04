import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerHaptic } from "../utils/haptics";
import { COLORS } from "../constants/colors";
import { formatDueDate, formatTaskDate } from "../utils/date";

const PRIORITY_CONFIG = {
  high: { label: "High", color: COLORS.danger, bg: COLORS.dangerLight },
  medium: { label: "Medium", color: COLORS.warning, bg: COLORS.warningLight },
  low: { label: "Low", color: COLORS.success, bg: COLORS.successLight },
};

const CATEGORY_ICONS = {
  General: "ellipse-outline",
  Work: "briefcase-outline",
  Personal: "person-outline",
  Shopping: "cart-outline",
  Education: "school-outline",
  // Legacy Turkish keys support
  Genel: "ellipse-outline",
  İş: "briefcase-outline",
  Kişisel: "person-outline",
  Alışveriş: "cart-outline",
  Eğitim: "school-outline",
};

const CATEGORY_LABELS = {
  Genel: "General",
  İş: "Work",
  Kişisel: "Personal",
  Alışveriş: "Shopping",
  Eğitim: "Education",
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
  const categoryIcon = CATEGORY_ICONS[task.category] || "bookmark-outline";
  const categoryLabel = CATEGORY_LABELS[task.category] || task.category;
  const dueLabel = formatDueDate(task.dueDate);
  const formattedDate = formatTaskDate(task.createdAt);

  const handleToggle = () => {
    triggerHaptic(task.completed ? "light" : "success");
    onToggle(task.id);
  };

  const handleEdit = () => {
    triggerHaptic("light");
    if (onEdit) onEdit(task);
  };

  const handleDelete = () => {
    triggerHaptic("warning");
    onDelete(task.id);
  };

  return (
    <View style={[styles.card, task.completed && styles.cardCompleted]}>
      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkboxTouch}
        onPress={handleToggle}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: Boolean(task.completed) }}
        accessibilityLabel={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
      >
        {task.completed ? (
          <View style={styles.completedCheckbox}>
            <Ionicons name="checkmark" size={16} color={COLORS.black} />
          </View>
        ) : (
          <View style={styles.uncompletedCheckbox} />
        )}
      </TouchableOpacity>

      {/* Content */}
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={handleToggle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${task.title}. ${task.completed ? "Completed" : "Active"}. Tap to toggle status.`}
      >
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {/* Metadata Badges (Category, Priority, Due Date, Created Date) */}
        <View style={styles.metadataRow}>
          {categoryLabel && (
            <View style={styles.categoryBadge}>
              <Ionicons name={categoryIcon} size={11} color={COLORS.black} />
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>
          )}

          <View
            style={[styles.priorityBadge, { backgroundColor: priority.bg }]}
          >
            <Text style={[styles.priorityText, { color: priority.color }]}>
              {priority.label}
            </Text>
          </View>

          {dueLabel && (
            <View style={styles.dueBadge}>
              <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
              <Text style={styles.dueText}>{dueLabel}</Text>
            </View>
          )}

          {formattedDate ? (
            <Text style={styles.dateText}>{formattedDate}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Action Buttons (Edit & Delete) */}
      <View style={styles.actionButtonsRow}>
        {onEdit && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEdit}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${task.title}`}
          >
            <Ionicons name="pencil-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  cardCompleted: {
    backgroundColor: "#FAFAFA",
    borderColor: "#E4E4E7",
    opacity: 0.75,
  },
  checkboxTouch: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#FBDB04",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  uncompletedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D4D4D8",
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#18181B",
    marginBottom: 6,
    lineHeight: 21,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#A1A1AA",
    fontWeight: "500",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 4,
    borderWidth: 1,
    borderColor: "#FEF08A",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000000",
    marginLeft: 3,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 4,
  },
  dueText: {
    fontSize: 11,
    color: "#52525B",
    fontWeight: "600",
    marginLeft: 3,
  },
  dateText: {
    fontSize: 11,
    color: "#A1A1AA",
    fontWeight: "500",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionButton: {
    padding: 6,
  },
});
