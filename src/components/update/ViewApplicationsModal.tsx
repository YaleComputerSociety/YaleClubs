"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, FileText, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import type { FormQuestion } from "@/lib/applicationForms";

type SavedApplicationForm = {
  _id: string;
  title: string;
  opensAt: string;
  closesAt: string;
  questions: FormQuestion[];
};

type FormsPage = { forms: SavedApplicationForm[]; nextCursor: string | null };

async function fetchForms(clubId: string, before?: string, signal?: AbortSignal): Promise<FormsPage> {
  const params = new URLSearchParams({ clubId });
  if (before) params.set("before", before);
  const response = await fetch(`/api/application-forms?${params}`, {
    cache: "no-store",
    ...(signal ? { signal } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to load applications. Please try again.");
  return result;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ViewApplicationsModal({
  clubId,
  clubName,
  onClose,
  onCreate,
}: {
  clubId: string;
  clubName: string;
  onClose: () => void;
  onCreate: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropPointerDownRef = useRef(false);
  const [forms, setForms] = useState<SavedApplicationForm[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const loadingMoreRef = useRef(false);
  const moreControllerRef = useRef<AbortController | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletingRef = useRef(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmDeleteId) cancelDeleteRef.current?.focus();
  }, [confirmDeleteId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setIsLoadingMore(false);
    setError("");
    setForms([]);
    setNextCursor(null);
    fetchForms(clubId, undefined, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setForms(page.forms);
        setNextCursor(page.nextCursor);
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : "Unable to load applications.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => {
      controller.abort();
      moreControllerRef.current?.abort();
      loadingMoreRef.current = false;
    };
  }, [clubId, reload]);

  const loadMore = async () => {
    if (!nextCursor || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const controller = new AbortController();
    moreControllerRef.current = controller;
    setIsLoadingMore(true);
    setError("");
    try {
      const page = await fetchForms(clubId, nextCursor, controller.signal);
      if (controller.signal.aborted) return;
      setForms((current) => [...current, ...page.forms]);
      setNextCursor(page.nextCursor);
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(reason instanceof Error ? reason.message : "Unable to load applications.");
    } finally {
      loadingMoreRef.current = false;
      if (!controller.signal.aborted) setIsLoadingMore(false);
    }
  };

  const deleteForm = async (form: SavedApplicationForm) => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const params = new URLSearchParams({ clubId, formId: form._id });
      const response = await fetch(`/api/application-forms?${params}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete the application. Please try again.");
      setForms((current) => current.filter((entry) => entry._id !== form._id));
      setConfirmDeleteId(null);
      setDeleteMessage(`Application “${form.title}” deleted.`);
      createButtonRef.current?.focus();
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Unable to delete the application.");
    } finally {
      deletingRef.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="view-applications-title"
      aria-describedby="view-applications-club"
      onClose={onClose}
      onCancel={(event) => {
        if (isDeleting) event.preventDefault();
      }}
      onPointerDown={(event) => {
        backdropPointerDownRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (!isDeleting && backdropPointerDownRef.current && event.target === event.currentTarget)
          event.currentTarget.close();
        backdropPointerDownRef.current = false;
      }}
      className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%_-_1rem)] max-w-3xl rounded-2xl bg-gray-50 p-0 backdrop:bg-black/50"
    >
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-5 sm:px-6">
        <div>
          <h1 id="view-applications-title" className="text-lg font-semibold text-gray-900">
            Applications
          </h1>
          <p id="view-applications-club" className="mt-1 text-sm text-gray-500">
            {clubName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            ref={createButtonRef}
            disabled={isDeleting}
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-clubPurple px-3 py-2 text-sm font-medium text-white hover:bg-clubBlurple"
          >
            <Plus size={16} aria-hidden="true" />
            Create Application
          </button>
          <button
            type="button"
            aria-label="Close applications"
            disabled={isDeleting}
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="space-y-4 p-5 sm:p-6" aria-busy={isLoading || isLoadingMore}>
        {deleteMessage && (
          <p role="status" className="text-sm text-green-700">
            {deleteMessage}
          </p>
        )}
        {isLoading && (
          <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Loading applications…
          </p>
        )}
        {!isLoading && !error && !nextCursor && forms.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <FileText className="mx-auto mb-3 text-clubPurple" size={32} aria-hidden="true" />
            <h2 className="font-semibold text-gray-800">No applications yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Create an application to set its dates and build your questions.
            </p>
          </div>
        )}
        {forms.map((form) => {
          const now = Date.now();
          const status =
            now < new Date(form.opensAt).getTime()
              ? "Scheduled"
              : now >= new Date(form.closesAt).getTime()
                ? "Closed"
                : "Open";
          const statusStyle =
            status === "Open"
              ? "bg-green-50 text-green-700"
              : status === "Scheduled"
                ? "bg-purple-50 text-clubPurple"
                : "bg-gray-100 text-gray-600";
          return (
            <article key={form._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="space-y-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="break-words font-semibold text-gray-900">{form.title}</h2>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle}`}>{status}</span>
                    <button
                      type="button"
                      aria-label={`Delete ${form.title}`}
                      disabled={isDeleting}
                      onClick={() => {
                        setConfirmDeleteId(form._id);
                        setDeleteError("");
                        setDeleteMessage("");
                      }}
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {confirmDeleteId === form._id && (
                  <div
                    role="group"
                    aria-label={`Confirm deletion of ${form.title}`}
                    className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm"
                  >
                    <p className="text-red-800">
                      Delete “{form.title}”? This permanently removes the form and its questions.
                    </p>
                    {deleteError && (
                      <p role="alert" className="text-red-700">
                        {deleteError}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        ref={cancelDeleteRef}
                        type="button"
                        disabled={isDeleting}
                        onClick={() => {
                          setConfirmDeleteId(null);
                          setDeleteError("");
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => deleteForm(form)}
                        className="rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting…" : "Confirm delete"}
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <p className="flex items-start gap-2 text-gray-600">
                    <CalendarDays size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-xs text-gray-500">Opens</span>
                      <time dateTime={form.opensAt}>{formatDate(form.opensAt)}</time>
                    </span>
                  </p>
                  <p className="flex items-start gap-2 text-gray-600">
                    <CalendarDays size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-xs text-gray-500">Closes</span>
                      <time dateTime={form.closesAt}>{formatDate(form.closesAt)}</time>
                    </span>
                  </p>
                </div>
              </div>
              <details className="group border-t border-gray-100">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-clubPurple hover:bg-purple-50 sm:px-5 [&::-webkit-details-marker]:hidden">
                  View {form.questions.length} {form.questions.length === 1 ? "question" : "questions"}
                  <ChevronDown
                    size={16}
                    className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <ol className="space-y-3 px-4 pb-4 sm:px-5">
                  {form.questions.map((question, index) => (
                    <li key={question.id} className="rounded-lg bg-gray-50 p-3">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        Question {index + 1} · {question.type === "short-answer" ? "Short answer" : "Multiple choice"}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm text-gray-900">{question.prompt}</p>
                      {question.type === "short-answer" ? (
                        <p className="mt-2 text-xs text-gray-500">{question.wordLimit} word limit</p>
                      ) : (
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                          {question.options.map((option) => (
                            <li key={option.id} className="whitespace-pre-wrap break-words">
                              {option.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </details>
            </article>
          );
        })}
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => (forms.length ? void loadMore() : setReload((current) => current + 1))}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}
        {nextCursor && !error && (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-clubPurple hover:bg-purple-50 disabled:opacity-50"
          >
            {isLoadingMore ? "Loading…" : "Load more applications"}
          </button>
        )}
        {forms.length > 0 && (
          <p className="text-center text-xs text-gray-500">Dates shown in your device’s local time zone.</p>
        )}
      </div>
    </dialog>
  );
}
