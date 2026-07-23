"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { ConfigMissing } from "@/components/ConfigMissing";
import { ProfileSetup } from "@/components/ProfileSetup";
import { SiteFooter, SiteHeader, SiteNavPill } from "@/components/SiteHeader";
import { useProfile } from "@/hooks/useProfile";
import { isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile } from "@/types";

interface PracticeGateProps {
  children: (ctx: {
    profile: UserProfile;
    updateProfile: (p: Omit<UserProfile, "id">) => void;
    resetProfile: () => void;
  }) => ReactNode;
}

export function PracticeGate({ children }: PracticeGateProps) {
  const { profile, hydrated, updateProfile, resetProfile } = useProfile();
  const configured = isSupabaseConfigured();

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
        <div className="mx-auto w-full max-w-6xl flex-1 px-6 pt-7 sm:px-10 lg:px-12">
          <SiteHeader action={<SiteNavPill href="/">Home</SiteNavPill>} />
          <div className="flex items-center py-20">
            <ConfigMissing />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 sm:px-10 lg:px-12">
          <SiteHeader action={<SiteNavPill href="/">Home</SiteNavPill>} />
          <div className="flex flex-1 items-center py-16">
            <ProfileSetup onSave={updateProfile} />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <>
      {children({
        profile,
        updateProfile,
        resetProfile,
      })}
    </>
  );
}

export function PracticeChrome({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-10%] h-[55vh] w-[55vh] rounded-full bg-teal-400/15 blur-3xl animate-[call-orb_16s_ease-in-out_infinite_alternate] dark:bg-teal-400/10" />
        <div className="absolute -right-20 bottom-[-8%] h-[45vh] w-[45vh] rounded-full bg-sky-400/10 blur-3xl animate-[call-orb_18s_ease-in-out_infinite_alternate-reverse] dark:bg-sky-400/8" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--page-bg)_78%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 sm:px-10 lg:px-12">
        <SiteHeader action={action} />
        <main className="flex flex-1 flex-col py-8 sm:py-12">{children}</main>
      </div>

      <SiteFooter />
    </div>
  );
}

export function PracticeBackLink({ href = "/practice" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:inline dark:text-stone-400 dark:hover:text-stone-100"
    >
      Modes
    </Link>
  );
}
