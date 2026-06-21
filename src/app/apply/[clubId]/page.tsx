"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationQuestionType, IClub } from "@/lib/models/Club";
import { ApplicationStatus } from "@/lib/models/Application";

const ACTIVE_APPLICATION_STATUSES = [ApplicationStatus.SUBMITTED, ApplicationStatus.IN_REVIEW];

type Answer = {
  questionId: string;
  textAnswer?: string;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const STATUS_BADGE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  in_review: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ApplyPage() {
  const params = useParams();
  const clubId = params.clubId as string;
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const [club, setClub] = useState<IClub | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [applicantName, setApplicantName] = useState("");
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [fileAnswers, setFileAnswers] = useState<Record<string, File | null>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const clubRes = await axios.get<IClub>(`/api/clubs/${clubId}`);
        setClub(clubRes.data);

        if (isLoggedIn) {
          try {
            const appsRes = await axios.get<Array<{ status: string; clubId?: string }>>("/api/applications");
            const existing = appsRes.data.find(
              (application) =>
                String(application.clubId) === clubId &&
                ACTIVE_APPLICATION_STATUSES.includes(application.status as ApplicationStatus),
            );
            if (existing) setExistingStatus(existing.status);
          } catch {
            // ignore — not critical
          }
        }
      } catch {
        setError("Club not found.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [clubId, isLoggedIn]);

  const oversizedFiles = Object.entries(fileAnswers)
    .filter(([, file]) => file && file.size > MAX_FILE_SIZE_BYTES)
    .map(([, file]) => file!.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push(`/api/auth/redirect?from=/apply/${clubId}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const answers: Answer[] = Object.entries(textAnswers).map(([questionId, textAnswer]) => ({
        questionId,
        textAnswer,
      }));

      const payload = { clubId, applicantName: applicantName.trim() || user?.netid, answers };
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      Object.entries(fileAnswers).forEach(([questionId, file]) => {
        if (file) formData.append(`file_${questionId}`, file);
      });

      await axios.post("/api/applications", formData);
      setSubmitted(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Failed to submit application.");
      } else {
        setError("Failed to submit application.");
      }
    } finally {
      setIsSubmitting(false);
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

  if (error && !club) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Link href="/" className="text-clubPurple hover:underline">
              Back to clubs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const form = club?.applicationForm;

  if (!form?.enabled || !form.questions.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="text-center max-w-md mx-auto p-8">
            <p className="text-gray-600 text-lg mb-4">{club?.name} does not currently have an open application.</p>
            <Link href="/" className="text-clubPurple hover:underline">
              Browse other clubs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your application to {club?.name} has been submitted. You can track its status on your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/Profile"
                className="px-6 py-2 bg-clubPurple text-white rounded-xl hover:bg-clubBlurple transition-colors"
              >
                View Profile
              </Link>
              <Link href="/" className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Browse Clubs
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (existingStatus) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center mt-16">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Already Applied</h2>
            <p className="text-gray-600 mb-4">You already have an application for {club?.name}.</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE[existingStatus] ?? "bg-gray-100 text-gray-800"}`}
            >
              {existingStatus.replace("_", " ")}
            </span>
            <div className="mt-6">
              <Link href="/Profile" className="text-clubPurple hover:underline">
                View on Profile
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <div className="flex-grow mt-16">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Club header */}
          <div className="flex items-center gap-4 mb-8">
            {club?.logo && (
              <Image
                src={club.logo}
                alt={club.name}
                width={56}
                height={56}
                className="rounded-xl object-cover w-14 h-14"
                onError={(e) => {
                  e.currentTarget.src = "/assets/default-logo.png";
                }}
              />
            )}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">{club?.name}</p>
              <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            </div>
          </div>

          {form.description && <p className="text-gray-600 mb-8 leading-relaxed">{form.description}</p>}

          {!isLoggedIn && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
              You must{" "}
              <a href={`/api/auth/redirect?from=/apply/${clubId}`} className="font-semibold underline">
                log in
              </a>{" "}
              to submit this application.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (optional)</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple"
              />
            </div>

            {/* Questions */}
            {form.questions.map((question, idx) => (
              <div key={question.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {idx + 1}. {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === ApplicationQuestionType.SHORT_ANSWER && (
                  <input
                    type="text"
                    required={question.required}
                    value={textAnswers[question.id] ?? ""}
                    onChange={(e) => setTextAnswers((p) => ({ ...p, [question.id]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple"
                  />
                )}

                {question.type === ApplicationQuestionType.LONG_ANSWER && (
                  <textarea
                    required={question.required}
                    rows={5}
                    value={textAnswers[question.id] ?? ""}
                    onChange={(e) => setTextAnswers((p) => ({ ...p, [question.id]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clubPurple/30 focus:border-clubPurple resize-y"
                  />
                )}

                {question.type === ApplicationQuestionType.FILE_DROP &&
                  (() => {
                    const selectedFile = fileAnswers[question.id];
                    const isOversized = !!selectedFile && selectedFile.size > MAX_FILE_SIZE_BYTES;
                    return (
                      <div>
                        <div
                          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                            isOversized ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-clubPurple"
                          }`}
                        >
                          <input
                            type="file"
                            required={question.required}
                            onChange={(e) =>
                              setFileAnswers((p) => ({ ...p, [question.id]: e.target.files?.[0] ?? null }))
                            }
                            className="hidden"
                            id={`file-${question.id}`}
                          />
                          <label htmlFor={`file-${question.id}`} className="cursor-pointer">
                            {selectedFile ? (
                              <span
                                className={isOversized ? "text-red-600 font-medium" : "text-clubPurple font-medium"}
                              >
                                {selectedFile.name}{" "}
                                <span className="font-normal text-sm">({formatBytes(selectedFile.size)})</span>
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                <span className="text-clubPurple font-medium">Click to upload</span> or drag and drop
                                <span className="block text-xs text-gray-400 mt-1">Max 10 MB</span>
                              </span>
                            )}
                          </label>
                        </div>
                        {isOversized && (
                          <p className="text-red-600 text-xs mt-1">
                            File is too large ({formatBytes(selectedFile!.size)}). Maximum size is 10 MB.
                          </p>
                        )}
                      </div>
                    );
                  })()}
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!isLoggedIn || isSubmitting || oversizedFiles.length > 0}
                className="px-8 py-3 bg-clubPurple text-white rounded-xl font-semibold hover:bg-clubBlurple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={oversizedFiles.length > 0 ? "Remove oversized files before submitting" : undefined}
              >
                {isSubmitting ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
