const NOTIFICATIONS_KEY = "talko.notifications";

/** Default: off until the user opts in on Settings. */
export function loadNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(NOTIFICATIONS_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveNotificationsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, enabled ? "1" : "0");
  } catch {
    /* private mode / quota */
  }
}
