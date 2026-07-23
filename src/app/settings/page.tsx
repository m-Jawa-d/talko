import type { Metadata } from "next";
import { SettingsPage } from "@/components/SettingsPage";

export const metadata: Metadata = {
  title: "Settings — Talko",
  description: "Theme and notification preferences for Talko.",
};

export default function SettingsRoute() {
  return <SettingsPage />;
}
