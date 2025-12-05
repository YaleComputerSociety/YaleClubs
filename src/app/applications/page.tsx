"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ApplicationsPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/api/auth/redirect");
      return;
    }

    // Route based on user role
    if (user?.role === "admin" || user?.role === "board") {
      router.push("/applications/admin");
    } else {
      router.push("/applications/student");
    }
  }, [isLoggedIn, user, router]);

  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
      <Footer />
    </main>
  );
}
