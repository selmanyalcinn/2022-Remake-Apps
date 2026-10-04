import { useCallback } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { usePreferences } from "../context/PreferencesContext.js";

export const useFeedback = () => {
  const { hapticsEnabled } = usePreferences();

  const run = useCallback(
    (callback) => {
      if (!hapticsEnabled || Platform.OS === "web") return;
      callback().catch(() => {});
    },
    [hapticsEnabled]
  );

  const tap = useCallback(() => {
    run(() => Haptics.selectionAsync());
  }, [run]);

  const success = useCallback(() => {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  }, [run]);

  const error = useCallback(() => {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  }, [run]);

  return { tap, success, error };
};
