import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import EmptyState from "./components/EmptyState";
import Header from "./components/Header";
import TaskItem from "./components/TaskItem";
import TaskModal from "./components/TaskModal";
import { COLORS } from "./constants/colors";
import { triggerHaptic } from "./utils/haptics";
import { getSearchScore } from "./utils/search";
import {
  getDueDateForOption,
  isDueToday,
  migrateTaskDueDate,
} from "./utils/date";

const STORAGE_KEY = "@todo_app_tasks_v2";

const CATEGORIES = [
  "All",
  "General",
  "Work",
  "Personal",
  "Shopping",
  "Education",
];

const LEGACY_CATEGORY_MAP = {
  Tümü: "All",
  Genel: "General",
  İş: "Work",
  Kişisel: "Personal",
  Alışveriş: "Shopping",
  Eğitim: "Education",
};

export default function App() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'completed'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [storageError, setStorageError] = useState("");
  const isHydratedRef = useRef(false);
  const writeQueueRef = useRef(Promise.resolve());

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    isHydratedRef.current = false;

    try {
      const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTasks !== null) {
        const parsedTasks = JSON.parse(savedTasks);
        if (!Array.isArray(parsedTasks)) {
          throw new Error("Stored tasks are not a valid list.");
        }
        const hasInvalidTask = parsedTasks.some(
          (task) =>
            !task ||
            typeof task !== "object" ||
            (typeof task.id !== "string" && typeof task.id !== "number") ||
            typeof task.title !== "string",
        );
        if (hasInvalidTask) {
          throw new Error("Stored tasks contain invalid entries.");
        }
        setTasks(
          parsedTasks.map((task) =>
            migrateTaskDueDate({ ...task, id: String(task.id) }),
          ),
        );
      } else {
        setTasks([]);
      }
      isHydratedRef.current = true;
    } catch (error) {
      console.error("Error loading tasks:", error);
      setLoadError(
        "Your saved tasks could not be loaded. Your existing data was left untouched.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistTasks = useCallback((tasksToPersist) => {
    const payload = JSON.stringify(tasksToPersist);
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, payload))
      .then(() => setStorageError(""))
      .catch((error) => {
        console.error("Error saving tasks:", error);
        setStorageError("Changes could not be saved. Tap here to retry.");
      });
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (isHydratedRef.current) {
      persistTasks(tasks);
    }
  }, [persistTasks, tasks]);

  // Add New Task or Update Existing Task
  const handleSaveTask = useCallback(
    ({ id, title, category, priority, dueTime }) => {
      setTasks((currentTasks) => {
        if (id) {
          return currentTasks.map((task) => {
            if (task.id !== id) return task;

            const scheduleChanged = task.dueTime !== dueTime;
            return {
              ...task,
              title,
              category,
              priority,
              dueTime,
              dueDate:
                scheduleChanged || !task.dueDate
                  ? getDueDateForOption(dueTime)
                  : task.dueDate,
            };
          });
        }

        const now = Date.now();
        const newTask = {
          id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
          title,
          category,
          priority,
          dueTime: dueTime || "today",
          dueDate: getDueDateForOption(dueTime),
          completed: false,
          createdAt: now,
        };

        return [newTask, ...currentTasks];
      });

      setEditingTask(null);
      setIsModalVisible(false);
    },
    [],
  );

  // Start Editing Task
  const handleOpenEdit = useCallback((task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  }, []);

  // Open Add Task Modal
  const handleOpenAdd = useCallback(() => {
    triggerHaptic("medium");
    setEditingTask(null);
    setIsModalVisible(true);
  }, []);

  // Toggle Task Status (Complete / Uncomplete)
  const handleToggleTask = useCallback(
    (id) => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      );
    },
    [],
  );

  // Delete Task
  const handleDeleteTask = useCallback(
    (id) => {
      if (Platform.OS === "web") {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this task?",
        );
        if (confirmDelete) {
          setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== id),
          );
        }
        return;
      }

      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            triggerHaptic("warning");
            setTasks((currentTasks) =>
              currentTasks.filter((task) => task.id !== id),
            );
          },
        },
      ]);
    },
    [],
  );

  // Clear All Completed Tasks
  const handleClearCompleted = useCallback(() => {
    if (Platform.OS === "web") {
      const confirmClear = window.confirm(
        "Are you sure you want to clear all completed tasks?",
      );
      if (confirmClear) {
        setTasks((currentTasks) =>
          currentTasks.filter((task) => !task.completed),
        );
      }
      return;
    }

    Alert.alert(
      "Clear Completed",
      "Are you sure you want to clear all completed tasks?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            triggerHaptic("warning");
            setTasks((currentTasks) =>
              currentTasks.filter((task) => !task.completed),
            );
          },
        },
      ],
    );
  }, []);

  // Filter & Search Logic with Memoization
  const filteredTasks = useMemo(() => {
    const trimmedQuery = searchQuery.trim();

    return tasks
      .filter((task) => {
        // Status Filter
        if (filter === "active" && task.completed) return false;
        if (filter === "completed" && !task.completed) return false;

        // Category Filter
        if (selectedCategory !== "All") {
          const normalizedTaskCategory =
            LEGACY_CATEGORY_MAP[task.category] || task.category;
          if (normalizedTaskCategory !== selectedCategory) return false;
        }

        // Search matching check
        if (trimmedQuery) {
          const score = getSearchScore(task, trimmedQuery);
          if (score === 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (trimmedQuery) {
          const scoreA = getSearchScore(a, trimmedQuery);
          const scoreB = getSearchScore(b, trimmedQuery);
          if (scoreB !== scoreA) {
            return scoreB - scoreA; // Highest relevance first
          }
        }
        return 0;
      });
  }, [tasks, filter, selectedCategory, searchQuery]);

  // Overall Task Counts
  const totalTasksCount = tasks.length;
  const completedTasksCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks],
  );
  const activeTasksCount = totalTasksCount - completedTasksCount;

  // Today's Task Counts for Header Progress Card & Badge
  const todayTasks = useMemo(
    () => tasks.filter((task) => isDueToday(task.dueDate)),
    [tasks],
  );
  const todayTasksCount = todayTasks.length;
  const todayCompletedCount = useMemo(
    () => todayTasks.filter((t) => t.completed).length,
    [todayTasks],
  );

  if (isLoading || loadError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color={COLORS.black} />
              <Text style={styles.loadingText}>Loading your tasks...</Text>
            </>
          ) : (
            <>
              <Ionicons name="alert-circle-outline" size={44} color={COLORS.danger} />
              <Text style={styles.loadErrorTitle}>Tasks unavailable</Text>
              <Text style={styles.loadErrorText}>{loadError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadTasks}
                accessibilityRole="button"
                accessibilityLabel="Retry loading tasks"
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor={COLORS.primary} />

      <View style={styles.container}>
        {/* Header & Progress Card */}
        <Header
          totalTasks={todayTasksCount}
          completedTasks={todayCompletedCount}
          totalAllCompleted={completedTasksCount}
          onClearCompleted={handleClearCompleted}
        />

        {storageError ? (
          <TouchableOpacity
            style={styles.storageErrorBanner}
            onPress={() => persistTasks(tasks)}
            accessibilityRole="button"
            accessibilityLabel="Retry saving task changes"
          >
            <Ionicons name="cloud-offline-outline" size={16} color={COLORS.white} />
            <Text style={styles.storageErrorText}>{storageError}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Controls Section (Search, Filter Tabs, Categories) */}
        <View style={styles.controlsSection}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor={COLORS.textPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search tasks"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic("light");
                  setSearchQuery("");
                }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filter Tabs */}
          <View style={styles.filterTabsContainer}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === "all" && styles.filterTabActive,
              ]}
              onPress={() => {
                triggerHaptic("selection");
                setFilter("all");
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === "all" }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === "all" && styles.filterTabTextActive,
                ]}
              >
                All ({totalTasksCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === "active" && styles.filterTabActive,
              ]}
              onPress={() => {
                triggerHaptic("selection");
                setFilter("active");
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === "active" }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === "active" && styles.filterTabTextActive,
                ]}
              >
                Active ({activeTasksCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === "completed" && styles.filterTabActive,
              ]}
              onPress={() => {
                triggerHaptic("selection");
                setFilter("completed");
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === "completed" }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === "completed" && styles.filterTabTextActive,
                ]}
              >
                Done ({completedTasksCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillActive,
                  ]}
                  onPress={() => {
                    triggerHaptic("selection");
                    setSelectedCategory(cat);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${cat} category`}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filter === "all"
                ? "All Tasks"
                : filter === "active"
                  ? "Active Tasks"
                  : "Completed Tasks"}
            </Text>
            <Text style={styles.sectionCount}>
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"}
            </Text>
          </View>
        </View>

        {/* Scrollable Tasks List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={filteredTasks.length > 0}
          bounces={filteredTasks.length > 0}
          style={styles.listContainer}
          contentContainerStyle={[
            styles.listContent,
            filteredTasks.length === 0 && styles.listContentEmpty,
          ]}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={handleToggleTask}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTask}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              filterType={filter}
              selectedCategory={selectedCategory}
              isSearching={Boolean(searchQuery.trim())}
              hasAnyTask={totalTasksCount > 0}
              onAddTask={handleOpenAdd}
            />
          }
        />

        {/* Floating Action Button (Yellow & Black) */}
        {totalTasksCount > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleOpenAdd}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add task"
          >
            <Ionicons name="add" size={32} color={COLORS.black} />
          </TouchableOpacity>
        )}

        {/* Task Add/Edit Modal */}
        {isModalVisible ? (
          <TaskModal
            visible
            onClose={() => {
              setIsModalVisible(false);
              setEditingTask(null);
            }}
            onSubmit={handleSaveTask}
            editingTask={editingTask}
            defaultCategory={
              selectedCategory !== "All" ? selectedCategory : "General"
            }
          />
        ) : null}
      </View>
      <View
        pointerEvents="none"
        style={[styles.bottomSafeAreaCover, { height: insets.bottom }]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: "100%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  loadErrorTitle: {
    marginTop: 12,
    color: COLORS.textHeading,
    fontSize: 18,
    fontWeight: "800",
  },
  loadErrorText: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "800",
  },
  storageErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.danger,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  storageErrorText: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 110,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 120,
  },
  controlsSection: {
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.black,
    outlineStyle: "none",
  },
  filterTabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.border,
    borderRadius: 14,
    padding: 3,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 11,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: COLORS.black,
    fontWeight: "800",
  },
  categoryScroll: {
    paddingVertical: 4,
    marginBottom: 14,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  categoryPillTextActive: {
    color: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomSafeAreaCover: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
  },
});
