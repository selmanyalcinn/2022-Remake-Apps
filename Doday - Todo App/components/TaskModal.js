import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerHaptic } from "../utils/haptics";
import { COLORS } from "../constants/colors";
import { getDueOptionForDate, normalizeDueOption } from "../utils/date";

const CATEGORIES = [
  { key: "General", label: "General", icon: "ellipse-outline" },
  { key: "Work", label: "Work", icon: "briefcase-outline" },
  { key: "Personal", label: "Personal", icon: "person-outline" },
  { key: "Shopping", label: "Shopping", icon: "cart-outline" },
  { key: "Education", label: "Education", icon: "school-outline" },
];

const PRIORITIES = [
  { key: "low", label: "Low", color: COLORS.success, bg: COLORS.successLight },
  { key: "medium", label: "Medium", color: COLORS.warning, bg: COLORS.warningLight },
  { key: "high", label: "High", color: COLORS.danger, bg: COLORS.dangerLight },
];

const DUE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "this_week", label: "This Week" },
];

const LEGACY_CATEGORY_MAP = {
  Genel: "General",
  İş: "Work",
  Kişisel: "Personal",
  Alışveriş: "Shopping",
  Eğitim: "Education",
};

export default function TaskModal({
  visible,
  onClose,
  onSubmit,
  editingTask = null,
  defaultCategory = "General",
}) {
  const initialCategory =
    LEGACY_CATEGORY_MAP[editingTask?.category || defaultCategory] ||
    editingTask?.category ||
    defaultCategory ||
    "General";
  const initialDueTime = editingTask?.dueDate
    ? getDueOptionForDate(editingTask.dueDate)
    : normalizeDueOption(editingTask?.dueTime);

  const [title, setTitle] = useState(editingTask?.title || "");
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState(editingTask?.priority || "medium");
  const [dueTime, setDueTime] = useState(initialDueTime);

  const isEditing = Boolean(editingTask);

  const handleSubmit = () => {
    if (!title.trim()) return;

    triggerHaptic("success");
    onSubmit({
      id: editingTask?.id,
      title: title.trim(),
      category,
      priority,
      dueTime,
    });
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setTitle("");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isEditing ? "Edit Task" : "Add New Task"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic("light");
                      handleClose();
                    }}
                    style={styles.closeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Close task form"
                  >
                    <Ionicons name="close" size={20} color={COLORS.black} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.scrollBody}
                >
                  {/* TextInput */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="What needs to be done?..."
                      placeholderTextColor={COLORS.textPlaceholder}
                      value={title}
                      onChangeText={setTitle}
                      multiline
                      maxLength={120}
                      blurOnSubmit={false}
                      accessibilityLabel="Task title"
                    />
                  </View>

                  {/* Category Selection */}
                  <Text style={styles.sectionLabel}>Category</Text>
                  <View style={styles.optionsRow}>
                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.key;
                      return (
                        <TouchableOpacity
                          key={cat.key}
                          style={[
                            styles.categoryChip,
                            isSelected && styles.categoryChipActive,
                          ]}
                          onPress={() => {
                            triggerHaptic("selection");
                            setCategory(cat.key);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${cat.label} category`}
                        >
                          <Ionicons
                            name={cat.icon}
                            size={14}
                            color={isSelected ? COLORS.black : COLORS.textSecondary}
                          />
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextActive,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Priority Level */}
                  <Text style={styles.sectionLabel}>Priority Level</Text>
                  <View style={styles.optionsRow}>
                    {PRIORITIES.map((p) => {
                      const isSelected = priority === p.key;
                      return (
                        <TouchableOpacity
                          key={p.key}
                          style={[
                            styles.priorityChip,
                            isSelected && {
                              backgroundColor: p.color,
                              borderColor: p.color,
                            },
                          ]}
                          onPress={() => {
                            triggerHaptic("selection");
                            setPriority(p.key);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${p.label} priority`}
                        >
                          <Text
                            style={[
                              styles.priorityChipText,
                              { color: isSelected ? COLORS.white : p.color },
                            ]}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Schedule */}
                  <Text style={styles.sectionLabel}>Schedule</Text>
                  <View style={styles.optionsRow}>
                    {DUE_OPTIONS.map((opt) => {
                      const isSelected = dueTime === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.dueChip,
                            isSelected && styles.dueChipActive,
                          ]}
                          onPress={() => {
                            triggerHaptic("selection");
                            setDueTime(opt.key);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`Schedule ${opt.label}`}
                        >
                          <Ionicons
                            name="time-outline"
                            size={13}
                            color={isSelected ? COLORS.black : COLORS.textMuted}
                          />
                          <Text
                            style={[
                              styles.dueChipText,
                              isSelected && styles.dueChipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !title.trim() && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!title.trim()}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !title.trim() }}
                  accessibilityLabel={isEditing ? "Save task changes" : "Add task"}
                >
                  <Text style={styles.submitButtonText}>
                    {isEditing ? "Save Changes" : "Add Task"}
                  </Text>
                  <Ionicons
                    name={isEditing ? "checkmark" : "arrow-forward"}
                    size={18}
                    color={!title.trim() ? COLORS.textPlaceholder : COLORS.black}
                  />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "90%",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.black,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  scrollBody: {
    paddingBottom: 10,
  },
  inputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.black,
    minHeight: 50,
    textAlignVertical: "top",
    outlineStyle: "none",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.black,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  chipTextActive: {
    color: COLORS.black,
  },
  priorityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.cardSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: "800",
  },
  dueChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  dueChipActive: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.black,
    borderWidth: 1.5,
  },
  dueChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dueChipTextActive: {
    color: COLORS.black,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "800",
    marginRight: 8,
  },
});

