"use client";

import { useCallback, useEffect, useState } from "react";
import { clearProfile, loadProfile, saveProfile } from "@/lib/profile";
import { LanguageLevel, LearningLanguage, UserProfile } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
  }, []);

  const updateProfile = useCallback(
    (input: {
      displayName: string;
      level: LanguageLevel;
      learning: LearningLanguage;
    }) => {
      const next = saveProfile(input);
      setProfile(next);
      return next;
    },
    []
  );

  const resetProfile = useCallback(() => {
    clearProfile();
    setProfile(null);
  }, []);

  return { profile, hydrated, updateProfile, resetProfile };
}
