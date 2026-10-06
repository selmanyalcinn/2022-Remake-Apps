import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  BackHandler,
} from "react-native";
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather, AntDesign } from "@expo/vector-icons";
import Note from "./Components/Notes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  createNoteId,
  deserializeNotes,
  MAX_NOTE_LENGTH,
  serializeNotes,
} from "./utils/notes.mjs";

const STORAGE_KEY = "@notes";
const RECOVERY_STORAGE_KEY = "@notes_recovery_backup";

// ─── Note Modal Component ────────────────────────────────────────
function NoteModal({
  onClose,
  onSave,
  onDelete,
  isEditing,
  initialTitle,
  initialText,
  isSaving,
}) {
  const [title, setTitle] = useState(initialTitle || "");
  const [text, setText] = useState(initialText || "");
  const [transition] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(transition, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [transition]);

  const closeEditor = useCallback(() => {
    if (isSaving) return;
    Animated.timing(transition, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(onClose);
  }, [isSaving, onClose, transition]);

  const hasUnsavedChanges =
    title !== (initialTitle || "") || text !== (initialText || "");

  const requestClose = useCallback(() => {
    if (isSaving) return;
    if (!hasUnsavedChanges) {
      closeEditor();
      return;
    }

    Alert.alert(
      "Discard changes?",
      "Your unsaved changes will be lost.",
      [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: closeEditor },
      ],
    );
  }, [closeEditor, hasUnsavedChanges, isSaving]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        requestClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [requestClose]);
  const handleSave = async () => {
    if (title.trim() === "" || text.trim() === "") {
      Alert.alert("Warning!", "Title and text cannot be empty!");
      return;
    }
    await onSave(title.trim(), text.trim());
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.editorScreen}>
      <SafeAreaView style={styles.editorSafeArea} edges={["top"]}>
        <StatusBar style="dark" />
        <Animated.View
          style={[
            styles.editorAnimated,
            {
              opacity: transition,
            },
          ]}
        >
          <View style={styles.editorHeader}>
            <TouchableOpacity
              style={styles.editorBackAction}
              onPress={requestClose}
              activeOpacity={0.7}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Close note editor"
            >
              <Feather name="arrow-left" size={22} color="#1a1a1a" />
              <Text style={styles.editorHeaderTitle}>
                {isEditing ? "Edit Note" : "New Note"}
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.editorKeyboardAvoid}
          >
            <ScrollView
              style={styles.editorScroll}
              contentContainerStyle={styles.editorContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter note title..."
                placeholderTextColor="#bbb"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Content</Text>
              <TextInput
                multiline={true}
                style={styles.editorTextInput}
                placeholder="Write your note here..."
                placeholderTextColor="#bbb"
                value={text}
                onChangeText={setText}
                maxLength={MAX_NOTE_LENGTH}
                textAlignVertical="top"
              />

              <View style={styles.editorActions}>
                {isEditing && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="Delete note"
                  >
                    <AntDesign name="delete" size={20} color="#fff" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    isEditing && { flex: 1, marginLeft: 12 },
                    !isEditing && { width: "100%" },
                  ]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                  disabled={isSaving}
                  accessibilityRole="button"
                  accessibilityLabel="Save note"
                >
                  {isSaving ? (
                    <ActivityIndicator color="#1a1a1a" />
                  ) : (
                    <>
                      <Feather name="check" size={20} color="#1a1a1a" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Empty State Component ───────────────────────────────────────
function EmptyState({ onCreateNote }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather name="file-text" size={48} color="#fbdb04" />
      </View>
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first note and start organizing your thoughts
      </Text>
      <TouchableOpacity
        style={styles.emptyCreateButton}
        onPress={onCreateNote}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create your first note"
      >
        <Feather name="plus" size={20} color="#1a1a1a" />
        <Text style={styles.emptyCreateButtonText}>Create Note</Text>
      </TouchableOpacity>
    </View>
  );
}

function StorageErrorState({ onRetry, onReset }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather name="alert-triangle" size={44} color="#b42318" />
      </View>
      <Text style={styles.emptyTitle}>Notes could not be loaded</Text>
      <Text style={styles.emptySubtitle}>
        Your stored data was left untouched. Try loading it again.
      </Text>
      <TouchableOpacity
        style={styles.emptyCreateButton}
        onPress={onRetry}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Retry loading notes"
      >
        <Feather name="refresh-cw" size={20} color="#1a1a1a" />
        <Text style={styles.emptyCreateButtonText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.resetDataButton}
        onPress={onReset}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Reset unreadable local notes"
      >
        <Text style={styles.resetDataButtonText}>Reset Local Data</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main App ────────────────────────────────────────────────────
function AppContent() {
  const insets = useSafeAreaInsets();
  const operationInFlight = useRef(false);
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;

    const { width, height } = Dimensions.get("window");
    const isTablet =
      Platform.OS === "ios"
        ? Platform.isPad
        : Math.min(width, height) >= 600;

    const setOrientation = async () => {
      try {
        if (isTablet) {
          await ScreenOrientation.unlockAsync();
        } else {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT,
          );
        }
      } catch (error) {
        console.warn("Failed to set screen orientation:", error);
      }
    };

    setOrientation();
  }, []);

  // Load notes from storage
  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const { notes: storedNotes, needsMigration } = deserializeNotes(stored);
      setNotes(storedNotes);

      if (needsMigration) {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, serializeNotes(storedNotes));
        } catch (migrationError) {
          // Reading succeeded, so keep the user's notes visible. A later save
          // will retry persistence and surface a user-facing error if needed.
          console.warn("Failed to migrate stored notes:", migrationError);
        }
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save notes to storage
  const saveNotesToStorage = useCallback(async (updatedNotes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, serializeNotes(updatedNotes));
      setNotes(updatedNotes);
      return true;
    } catch (error) {
      console.error("Failed to save notes:", error);
      Alert.alert(
        "Could not save note",
        "Your changes were not saved. The editor will remain open so you can try again.",
      );
      return false;
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadNotes, 0);
    return () => clearTimeout(timeout);
  }, [loadNotes]);

  // Add new note
  const handleAddNote = useCallback(() => {
    setEditingNote(null);
    setModalVisible(true);
  }, []);

  // Open existing note for editing
  const handleOpenNote = useCallback((note) => {
    setEditingNote(note);
    setModalVisible(true);
  }, []);

  // Save (create or update)
  const handleSave = useCallback(
    async (title, text) => {
      if (operationInFlight.current) return false;
      operationInFlight.current = true;
      setIsSaving(true);
      try {
        let updated;
        if (editingNote) {
          updated = notes.map((note) =>
            note.id === editingNote.id
              ? { ...note, title, text, updatedAt: Date.now() }
              : note,
          );
        } else {
          const now = Date.now();
          updated = [
            {
              id: createNoteId(),
              title,
              text,
              createdAt: now,
              updatedAt: now,
            },
            ...notes,
          ];
        }

        const saved = await saveNotesToStorage(updated);
        if (saved) {
          setModalVisible(false);
          setEditingNote(null);
        }
        return saved;
      } finally {
        operationInFlight.current = false;
        setIsSaving(false);
      }
    },
    [editingNote, notes, saveNotesToStorage],
  );

  // Delete note
  const handleDelete = useCallback(async () => {
    if (!editingNote || operationInFlight.current) return;
    operationInFlight.current = true;
    setIsSaving(true);
    try {
      const filtered = notes.filter((note) => note.id !== editingNote.id);
      const saved = await saveNotesToStorage(filtered);
      if (saved) {
        setModalVisible(false);
        setEditingNote(null);
      }
    } finally {
      operationInFlight.current = false;
      setIsSaving(false);
    }
  }, [editingNote, notes, saveNotesToStorage]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingNote(null);
  }, []);

  const handleResetStorage = useCallback(() => {
    Alert.alert(
      "Reset local notes?",
      "Use this only if retry keeps failing. The unreadable data will be backed up internally before the app starts with an empty list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const stored = await AsyncStorage.getItem(STORAGE_KEY);
              if (stored !== null) {
                await AsyncStorage.setItem(RECOVERY_STORAGE_KEY, stored);
              }
              await AsyncStorage.removeItem(STORAGE_KEY);
              setNotes([]);
              setLoadError(false);
            } catch (error) {
              console.error("Failed to reset notes:", error);
              Alert.alert(
                "Could not reset notes",
                "Your stored data was left untouched. Please try again.",
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, []);

  // Render note item
  const renderNote = useCallback(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleOpenNote(item)}
        accessibilityRole="button"
        accessibilityLabel={`Open note: ${item.title}`}
      >
        <Note title={item.title} text={item.text} date={item.createdAt} />
      </TouchableOpacity>
    ),
    [handleOpenNote],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Noto</Text>
            <Text style={styles.headerSubtitle}>
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.listContainer}>
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            notes.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#1a1a1a" />
            ) : loadError ? (
              <StorageErrorState
                onRetry={loadNotes}
                onReset={handleResetStorage}
              />
            ) : (
              <EmptyState onCreateNote={handleAddNote} />
            )
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {notes.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          onPress={handleAddNote}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Create note"
        >
          <Feather name="plus" size={28} color="#1a1a1a" />
        </TouchableOpacity>
      )}

      {modalVisible && (
        <NoteModal
          key={editingNote?.id || "new-note"}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isEditing={!!editingNote}
          initialTitle={editingNote?.title}
          initialText={editingNote?.text}
          isSaving={isSaving}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbdb04",
  },

  // Header
  headerSafeArea: {
    backgroundColor: "#fbdb04",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 48 : 12,
    paddingBottom: 20,
    width: "100%",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(0,0,0,0.5)",
    marginTop: 2,
    fontWeight: "500",
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContainer: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(251, 219, 4, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbdb04",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: "#fbdb04",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyCreateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  resetDataButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resetDataButtonText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "600",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 36,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#fbdb04",
    borderWidth: 0.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },

  // Full-screen editor
  editorScreen: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#f2f2f7",
    zIndex: 20,
  },
  editorSafeArea: {
    flex: 1,
    backgroundColor: "#fbdb04",
  },
  editorAnimated: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  editorKeyboardAvoid: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fbdb04",
  },
  editorBackAction: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    paddingRight: 12,
  },
  editorHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "left",
    marginLeft: 6,
  },
  editorContent: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
  },
  editorScroll: {
    backgroundColor: "#f2f2f7",
  },
  editorTextInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
    minHeight: 260,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    textAlignVertical: "top",
  },
  editorActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  // Legacy modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "center",
  },
  keyboardAvoidWithKeyboard: {
    justifyContent: "flex-start",
    paddingTop: 16,
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "85%",
    maxWidth: 640,
    width: "92%",
    alignSelf: "center",
  },
  modalViewWithKeyboard: {
    maxHeight: "94%",
    borderRadius: 18,
  },
  modalContent: {
    paddingBottom: 8,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f2f2f7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  titleInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  textInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 20,
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#eee",
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveButton: {
    backgroundColor: "#fbdb04",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    flex: 0.8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
});
