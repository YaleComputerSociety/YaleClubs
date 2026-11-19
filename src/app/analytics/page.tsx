"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/catalog/DisplayHeader";
import "@/app/display.css";
import "@/app/supporting-pages.css";
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
      <div className="club-display supporting-page analytics-page">
        <Header />
        <main className="supporting-content analytics-sign-in">
          <div className="analytics-sign-in-card">
            <p className="analytics-sign-in-title">Log in to view analytics.</p>
            <a href="/api/auth/redirect" className="supporting-button">
              Sign In
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="club-display supporting-page analytics-page">
      <Header />
      <main className="supporting-content">
        <div className="analytics-content">
          <div className="analytics-heading">
            <h1 className="supporting-title">Club Analytics</h1>
          </div>

          {loading && (
            <div className="analytics-loading" role="status" aria-label="Loading analytics">
              <div className="analytics-spinner" />
            </div>
          )}

          {error && (
            <div className="analytics-error" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && clubs.length === 0 && (
            <div className="analytics-empty">
              You are not a leader of any club. Analytics are available for clubs you lead.
            </div>
          )}

          {!loading && !error && clubs.length > 0 && (
            <div className="analytics-table-wrap" tabIndex={0} role="region" aria-label="Club analytics">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th className="analytics-text">Club</th>
                    <th className="analytics-number">Followers</th>
                    <th className="analytics-number">Modal views (7d)</th>
                    <th className="analytics-number">Modal views (30d)</th>
                    <th className="analytics-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <tr key={club.clubId}>
                      <td className="analytics-club-name">{club.name}</td>
                      <td className="analytics-number">{club.followers}</td>
                      <td className="analytics-number">{club.modalViews7d}</td>
                      <td className="analytics-number">{club.modalViews30d}</td>
                      <td className="analytics-actions">
                        <Link href={`/update?clubId=${club.clubId}`} className="analytics-edit">
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
    </div>
  );
}
