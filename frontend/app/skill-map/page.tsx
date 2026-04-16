"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Skill Map has been merged into Career Path page
export default function SkillMapRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/career-path"); }, [router]);
  return null;
}
