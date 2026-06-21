"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationQuestion, ApplicationQuestionType, ClubApplicationForm, IClub } from "@/lib/models/Club";

const TYPE_LABELS: Record<ApplicationQuestionType, string> = {
  [ApplicationQuestionType.SHORT_ANSWER]: "Short Answer",
  [ApplicationQuestionType.LONG_ANSWER]: "Long Answer",
  [ApplicationQuestionType.FILE_DROP]: "File Upload",
};

const TYPE_ICONS: Record<ApplicationQuestionType, string> = {
  [ApplicationQuestionType.SHORT_ANSWER]: "━",
  [ApplicationQuestionType.LONG_ANSWER]: "☰",
  [ApplicationQuestionType.FILE_DROP]: "↑",
};

const DEFAULT_FORM: ClubApplicationForm = {
  enabled: false,
  title: "Club Application",
  description: "",
  questions: [],
};

export default function ApplicationBuilderPage() {
  const params = useParams();
  const clubId = params.clubId as string;
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const [club, setClub] = useState<IClub | null>(null);
  const [form, setForm] = useState<ClubApplicationForm>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get<IClub>(`/api/clubs/${clubId}`);
        const loadedClub = res.data;
        setClub(loadedClub);
        if (loadedClub.applicationForm) {
          setForm(loadedClub.applicationForm);
        }
      } catch {
        setError("Club not found.");
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

  const addQuestion = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: crypto.randomUUID(),
          label: "",
          type: ApplicationQuestionType.SHORT_ANSWER,
          required: false,
        },
      ],
    }));
  }, []);

  const updateQuestion = useCallback((index: number, updates: Partial<ApplicationQuestion>) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    }));
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  }, []);

  const moveQuestion = useCallback((index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const qs = [...prev.questions];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= qs.length) return prev;
      [qs[index], qs[target]] = [qs[target], qs[index]];
      return { ...prev, questions: qs };
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await axios.put("/api/clubs/application-form", { clubId, applicationForm: form });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Failed to save the form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Top bar */}
          <div className="flex items-center gap-4 mb-8">
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
              <h1 className="text-2xl font-bold text-gray-900">Application Form Builder</h1>
            </div>
            <Link
              href={`/applications/review/${clubId}`}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Applications
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {/* Form settings card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Settings</h2>

            {/* Enable toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <p className="font-medium text-gray-800">Accept Applications</p>
                <p className="text-sm text-gray-500">
                  When enabled, the &quot;Apply&quot; button appears on your club page
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, enabled: !p.enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  form.enabled ? "bg-clubPurple" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Spring 2025 Application"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Tell applicants what this form is for, deadlines, or any instructions…"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple resize-y"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Questions <span className="text-sm font-normal text-gray-400 ml-1">({form.questions.length})</span>
              </h2>
            </div>

            {form.questions.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                No questions yet. Add one below.
              </div>
            )}

            <div className="space-y-3">
              {form.questions.map((question, idx) => (
                <div key={question.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    {/* Index + reorder */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-20"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <span className="text-xs text-gray-400 font-medium">{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, "down")}
                        disabled={idx === form.questions.length - 1}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-20"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Question label */}
                      <input
                        type="text"
                        value={question.label}
                        onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                        placeholder="Question text…"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple"
                      />

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Type selector */}
                        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                          {Object.values(ApplicationQuestionType).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => updateQuestion(idx, { type })}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                question.type === type
                                  ? "bg-white text-clubPurple shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <span className="text-xs">{TYPE_ICONS[type]}</span>
                              {TYPE_LABELS[type]}
                            </button>
                          ))}
                        </div>

                        {/* Required toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                            className="w-4 h-4 rounded accent-clubPurple"
                          />
                          <span className="text-sm text-gray-600">Required</span>
                        </label>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="ml-auto text-sm text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Preview */}
                      <div className="mt-2 rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Preview</p>
                        {question.type === ApplicationQuestionType.SHORT_ANSWER && (
                          <div className="h-9 bg-white border border-gray-200 rounded-lg" />
                        )}
                        {question.type === ApplicationQuestionType.LONG_ANSWER && (
                          <div className="h-24 bg-white border border-gray-200 rounded-lg" />
                        )}
                        {question.type === ApplicationQuestionType.FILE_DROP && (
                          <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            File upload area
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-clubPurple hover:text-clubPurple transition-colors font-medium"
            >
              + Add Question
            </button>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to clubs
            </Link>
            <div className="flex items-center gap-3">
              {saveSuccess && <span className="text-sm text-green-600 font-medium">Saved!</span>}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-clubPurple text-white rounded-xl font-semibold hover:bg-clubBlurple transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save Form"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
