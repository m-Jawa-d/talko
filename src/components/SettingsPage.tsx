"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BellOff, Moon, Sun } from "lucide-react";
import { SiteFooter, SiteHeader, SiteNavPill } from "@/components/SiteHeader";
import { useTheme, type Theme } from "@/components/ThemeProvider";
import { useSettings } from "@/hooks/useSettings";

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {description}
        </p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ThemeChoice({
  value,
  current,
  label,
  icon,
  onSelect,
}: {
  value: Theme;
  current: Theme;
  label: string;
  icon: React.ReactNode;
  onSelect: (theme: Theme) => void;
}) {
  const selected = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
        selected
          ? "bg-stone-900 text-white dark:bg-teal-400 dark:text-stone-950"
          : "bg-[var(--page-bg)] text-stone-600 ring-1 ring-[var(--page-border)] hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { hydrated, notificationsEnabled, setNotificationsEnabled } =
    useSettings();
  const [browserPermission, setBrowserPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setBrowserPermission("unsupported");
      return;
    }
    setBrowserPermission(Notification.permission);
  }, [notificationsEnabled]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_100%_0%,var(--accent-soft),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 sm:px-10 lg:px-12">
        <SiteHeader
          action={
            <>
              <Link
                href="/guide"
                className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:inline dark:text-stone-400 dark:hover:text-stone-100"
              >
                Guide
              </Link>
              <SiteNavPill href="/practice">Practice</SiteNavPill>
            </>
          }
        />

        <main className="flex-1 py-14 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              Preferences
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
              Settings
            </h1>
            <p className="mt-4 text-base leading-relaxed text-stone-500 dark:text-stone-400">
              Saved on this device only. Change appearance and how Talko alerts
              you when a call arrives.
            </p>
          </div>

          <div className="mt-12 max-w-xl space-y-0 divide-y divide-[var(--page-border)] rounded-[1.75rem] bg-[var(--page-surface)]/85 px-6 py-2 ring-1 ring-[var(--page-border)] sm:px-8">
            <div className="py-7">
              <SettingRow
                title="Theme"
                description="Light or dark. Applies across Talko on this browser."
              >
                <div className="flex flex-wrap gap-2">
                  <ThemeChoice
                    value="light"
                    current={theme}
                    label="Light"
                    icon={<Sun className="h-4 w-4" />}
                    onSelect={setTheme}
                  />
                  <ThemeChoice
                    value="dark"
                    current={theme}
                    label="Dark"
                    icon={<Moon className="h-4 w-4" />}
                    onSelect={setTheme}
                  />
                </div>
              </SettingRow>
            </div>

            <div className="py-7">
              <SettingRow
                title="Incoming alerts"
                description="Ringtone, vibration, and a browser notification when the tab is in the background. Off by default."
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationsEnabled}
                  disabled={!hydrated}
                  onClick={() =>
                    void setNotificationsEnabled(!notificationsEnabled)
                  }
                  className={`inline-flex h-11 items-center gap-2.5 rounded-full px-4 text-sm font-semibold transition disabled:opacity-50 ${
                    notificationsEnabled
                      ? "bg-teal-700 text-white dark:bg-teal-400 dark:text-stone-950"
                      : "bg-[var(--page-bg)] text-stone-600 ring-1 ring-[var(--page-border)] dark:text-stone-300"
                  }`}
                >
                  {notificationsEnabled ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                  {notificationsEnabled ? "On" : "Off"}
                </button>
              </SettingRow>
              {hydrated &&
              notificationsEnabled &&
              browserPermission === "denied" ? (
                <p className="mt-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                  Browser notifications are blocked. Ringtone still works while
                  Talko is open — allow notifications in your browser settings
                  for alerts when the tab is hidden.
                </p>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
