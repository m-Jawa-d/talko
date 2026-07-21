import type { Metadata } from "next";
import { GuidePage } from "@/components/GuidePage";

export const metadata: Metadata = {
  title: "How it works — Talko",
  description:
    "Create a profile, find a partner, allow your mic, and practice English in a live 1-on-1 call.",
};

export default function GuideRoute() {
  return <GuidePage />;
}
