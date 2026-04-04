"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { isDonorRole } from "@/types/user";

export function LandingRedirect() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (isDonorRole(user.role)) {
        router.replace("/donor/dashboard");
      } else {
        router.replace("/recipient/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return null;
}
