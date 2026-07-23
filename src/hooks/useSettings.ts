"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadNotificationsEnabled,
  saveNotificationsEnabled,
} from "@/lib/settings";

export function useSettings() {
  const [hydrated, setHydrated] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);

  useEffect(() => {
    setNotificationsEnabledState(loadNotificationsEnabled());
    setHydrated(true);
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    if (enabled && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          const result = await Notification.requestPermission();
          if (result !== "granted") {
            // Still allow in-tab ringtone/vibrate; OS banners need permission
          }
        } catch {
          /* ignore */
        }
      }
    }
    saveNotificationsEnabled(enabled);
    setNotificationsEnabledState(enabled);
  }, []);

  return {
    hydrated,
    notificationsEnabled,
    setNotificationsEnabled,
  };
}
