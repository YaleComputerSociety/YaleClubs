"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

interface ClubAnalytics {
  clubId: string;
  name: string;
  followers: number;
  modalViews7d: number;
  modalViews30d: number;
}

export default function AnalyticsPage() {
  const { isLoggedIn } = useAuth();
  const [clubs, setClubs] = useState<ClubAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/analytics/dashboard", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized");
          throw new Error("Failed to load analytics");
        }
        return res.json();
      })
      .then((data) => {
        setClubs(data.clubs ?? []);
      })
      .catch((err) => {
        setError(err.message ?? "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-100 flex items-center justify-center mt-24">
          <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md">
            <p className="text-xl font-semibold text-gray-700">Log in to view analytics.</p>
            <a
              href="/api/auth/redirect"
              className="inline-block mt-4 px-6 py-2 rounded-full bg-clubPurple text-white font-semibold hover:opacity-90"
            >
              Sign In
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex py-6 justify-center mt-24">
        <div className="bg-gray-100 rounded-lg shadow-md p-8 w-full max-w-6xl">
          <div className="flex items-center justify-between px-0 mb-6">
            <Link href="/">
              <button className="text-gray-400 py-2 px-4 rounded-lg hover:bg-gray-200">Back</button>
            </Link>
            <h1 className="text-3xl font-bold text-center flex-grow">Club Analytics</h1>
            <div className="w-20" />
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && clubs.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              You are not a leader of any club. Analytics are available for clubs you lead.
            </div>
          )}

          {!loading && !error && clubs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Club</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Followers</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Modal views (7d)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Modal views (30d)</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <tr key={club.clubId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{club.name}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{club.followers}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{club.modalViews7d}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{club.modalViews30d}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/update?clubId=${club.clubId}`}
                          className="text-clubPurple hover:underline font-medium"
                        >
                          Edit club
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
