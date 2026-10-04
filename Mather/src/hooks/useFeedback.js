import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { usePreferences } from "../context/PreferencesContext";

export function useFeedback() {
  const { hapticsEnabled } = usePreferences();

  const haptic = useCallback(
    (kind = "selection") => {
      if (!hapticsEnabled) return;
      try {
        const action =
          kind === "success"
            ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            : kind === "error"
              ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
              : kind === "warning"
                ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
                : Haptics.selectionAsync();
        Promise.resolve(action).catch(() => {});
      } catch {
        // Feedback support varies by browser and device hardware.
      }
    },
    [hapticsEnabled]
  );

  return { haptic };
}
