"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationQuestionType, IClub } from "@/lib/models/Club";
import { ApplicationStatus } from "@/lib/models/Application";

type ResponseItem = {
  questionId: string;
  label: string;
  type: ApplicationQuestionType;
  textAnswer?: string;
  fileUrl?: string;
  fileName?: string;
};

type ApplicationRecord = {
  _id: string;
  clubId: string;
  clubName: string;
  applicantNetid: string;
  applicantEmail: string;
  applicantName?: string;
  status: ApplicationStatus;
  responses: ResponseItem[];
  reviewerEmail?: string;
  reviewerNote?: string;
  createdAt: string;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
];

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SUBMITTED]: "Submitted",
  [ApplicationStatus.IN_REVIEW]: "In Review",
  [ApplicationStatus.ACCEPTED]: "Accepted",
  [ApplicationStatus.REJECTED]: "Rejected",
};

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SUBMITTED]: "bg-blue-100 text-blue-700",
  [ApplicationStatus.IN_REVIEW]: "bg-yellow-100 text-yellow-700",
  [ApplicationStatus.ACCEPTED]: "bg-green-100 text-green-700",
  [ApplicationStatus.REJECTED]: "bg-red-100 text-red-700",
};

const FILTER_TABS: Array<ApplicationStatus | "all"> = ["all", ...STATUS_OPTIONS];

export default function ReviewPage() {
  const params = useParams();
  const clubId = params.clubId as string;
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const [club, setClub] = useState<IClub | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [clubRes, appsRes] = await Promise.all([
          axios.get<IClub>(`/api/clubs/${clubId}`),
          axios.get<ApplicationRecord[]>("/api/applications", { params: { clubId } }),
        ]);
        setClub(clubRes.data);
        setApplications(appsRes.data);
      } catch {
        setError("Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [clubId]);

  useEffect(() => {
    if (!isLoading && club) {
      const isLeader = club.leaders.some((l) => l.email === user?.email);
      const isAdmin = user?.role === "admin";
      if (!isLoggedIn || (!isLeader && !isAdmin)) {
        router.push("/");
      } else {
        setCanAccess(true);
      }
    }
  }, [isLoading, club, isLoggedIn, user, router]);

  const updateStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      setSaving(applicationId);
      try {
        const note = noteEdits[applicationId];
        await axios.put(`/api/applications/${applicationId}`, { status, reviewerNote: note });
        setApplications((prev) =>
          prev.map((a) => (a._id === applicationId ? { ...a, status, reviewerNote: note ?? a.reviewerNote } : a)),
        );
      } catch {
        setError("Failed to update status.");
      } finally {
        setSaving(null);
      }
    },
    [noteEdits],
  );

  const filtered = activeFilter === "all" ? applications : applications.filter((a) => a.status === activeFilter);

  const counts = STATUS_OPTIONS.reduce(
    (acc, s) => ({ ...acc, [s]: applications.filter((a) => a.status === s).length }),
    {} as Record<ApplicationStatus, number>,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="w-8 h-8 border-4 border-clubPurple/30 border-t-clubPurple rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!canAccess) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <div className="flex-grow mt-16">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {club?.logo && (
              <Image
                src={club.logo}
                alt={club.name ?? ""}
                width={48}
                height={48}
                className="rounded-xl object-cover w-12 h-12"
                onError={(e) => {
                  e.currentTarget.src = "/assets/default-logo.png";
                }}
              />
            )}
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{club?.name}</p>
              <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            </div>
            <Link
              href={`/applications/builder/${clubId}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit Form
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {STATUS_OPTIONS.map((s) => (
              <div key={s} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{counts[s]}</p>
                <p className="text-xs text-gray-500 mt-1">{STATUS_LABEL[s]}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === tab ? "bg-white text-clubPurple shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "all" ? `All (${applications.length})` : `${STATUS_LABEL[tab]} (${counts[tab]})`}
              </button>
            ))}
          </div>

          {/* Application list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              No applications{" "}
              {activeFilter !== "all" ? `with status "${STATUS_LABEL[activeFilter as ApplicationStatus]}"` : "yet"}.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app) => {
                const isExpanded = expandedId === app._id;
                return (
                  <div key={app._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Summary row */}
                    <button
                      type="button"
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : app._id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {app.applicantName || app.applicantEmail}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{app.applicantEmail}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[app.status]}`}
                        >
                          {STATUS_LABEL[app.status]}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5 space-y-5">
                        {/* Responses */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                            Responses
                          </h3>
                          {app.responses.length === 0 ? (
                            <p className="text-gray-400 text-sm">No responses recorded.</p>
                          ) : (
                            <div className="space-y-4">
                              {app.responses.map((r) => (
                                <div key={r.questionId}>
                                  <p className="text-sm font-medium text-gray-700 mb-1">{r.label}</p>
                                  {r.type === ApplicationQuestionType.FILE_DROP ? (
                                    r.fileUrl ? (
                                      <a
                                        href={`/api/applications/files?applicationId=${app._id}&questionId=${r.questionId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-clubPurple hover:underline"
                                      >
                                        📎 {r.fileName ?? "View file"}
                                      </a>
                                    ) : (
                                      <span className="text-sm text-gray-400">No file uploaded</span>
                                    )
                                  ) : (
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                                      {r.textAnswer ?? <span className="text-gray-400 italic">No answer</span>}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Review actions */}
                        <div className="border-t border-gray-100 pt-4">
                          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Review</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                value={app.status}
                                onChange={(e) => updateStatus(app._id, e.target.value as ApplicationStatus)}
                                disabled={saving === app._id}
                                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple disabled:opacity-50"
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_LABEL[s]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reviewer Note{" "}
                                <span className="text-gray-400 font-normal">(optional, visible to applicant)</span>
                              </label>
                              <textarea
                                rows={2}
                                value={noteEdits[app._id] ?? app.reviewerNote ?? ""}
                                onChange={(e) => setNoteEdits((prev) => ({ ...prev, [app._id]: e.target.value }))}
                                placeholder="Add a note…"
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple resize-y"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={saving === app._id}
                                onClick={() => updateStatus(app._id, app.status)}
                                className="px-4 py-2 text-sm bg-clubPurple text-white rounded-xl hover:bg-clubBlurple transition-colors disabled:opacity-50"
                              >
                                {saving === app._id ? "Saving…" : "Save Note"}
                              </button>
                            </div>
                            {app.reviewerEmail && (
                              <p className="text-xs text-gray-400">Last reviewed by {app.reviewerEmail}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
