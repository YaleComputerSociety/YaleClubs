"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import type { AuthUser } from "@/lib/authUser";
import { useEffect, useState } from "react";

export default function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
