"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ListChecks, Plus } from "lucide-react";
import { motion, Reorder, useReducedMotion } from "framer-motion";
import { ApplicationQuestion, createApplicationQuestion, validateApplicationQuestion } from "./applicationQuestions";
import ApplicationQuestionCard from "./ApplicationQuestionCard";
import { MAX_FORM_QUESTIONS } from "@/lib/applicationForms";

type CreateApplicationModalProps = {
  onClose: () => void;
  clubId: string;
  onSaved?: (form: { id: string; title: string }) => void;
};

export default function CreateApplicationModal({ onClose, clubId, onSaved }: CreateApplicationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const questionListRef = useRef<HTMLUListElement>(null);
  const newQuestionButtonRef = useRef<HTMLButtonElement>(null);
  const backdropPointerDownRef = useRef(false);
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState("");
  const [validationAttempt, setValidationAttempt] = useState(0);
  const reduceMotion = useReducedMotion();
  const hasErrors =
    questions.length === 0 ||
    questions.some((question) => Object.keys(validateApplicationQuestion(question)).length > 0);
  const titleError = !title.trim() ? "Enter an application title." : "";
  const openingError = !opensAt || Number.isNaN(new Date(opensAt).getTime()) ? "Enter an opening date and time." : "";
  const closingError =
    !closesAt || Number.isNaN(new Date(closesAt).getTime())
      ? "Enter a closing date and time."
      : opensAt && new Date(closesAt) <= new Date(opensAt)
        ? "Closing must be after opening."
        : "";

  const handleSave = async () => {
    if (savingRef.current) return;
    setSaveError("");
    if (hasErrors || titleError || openingError || closingError) {
      setValidationAttempt((current) => current + 1);
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      const response = await fetch("/api/application-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          title: title.trim(),
          opensAt: new Date(opensAt).toISOString(),
          closesAt: new Date(closesAt).toISOString(),
          questions: questions.map((question) => ({
            id: question.id,
            type: question.type,
            prompt: question.prompt,
            ...(question.type === "short-answer"
              ? { wordLimit: Number(question.wordLimit) }
              : { options: question.options }),
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save the form. Please try again.");
      onSaved?.(result);
      dialogRef.current?.close();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save the form. Please try again.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!validationAttempt) return;
    const firstError = dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
    const target = firstError ?? newQuestionButtonRef.current;
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    target?.focus({ preventScroll: true });
  }, [validationAttempt, reduceMotion]);
  const addQuestion = () => {
    const question = createApplicationQuestion();
    setQuestions((current) => [...current, question]);
  };

  const moveQuestion = (questionId: string, direction: -1 | 1) => {
    setQuestions((current) => {
      const index = current.findIndex((question) => question.id === questionId);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) return current;

      const reordered = [...current];
      const [question] = reordered.splice(index, 1);
      reordered.splice(nextIndex, 0, question);
      return reordered;
    });
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <>
      <motion.dialog
        ref={dialogRef}
        layoutScroll
        layoutRoot
        aria-label="Create Application"
        onClose={onClose}
        onCancel={(event) => {
          if (isSaving) event.preventDefault();
        }}
        onPointerDown={(event) => {
          backdropPointerDownRef.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (!isSaving && backdropPointerDownRef.current && event.target === event.currentTarget)
            event.currentTarget.close();
          backdropPointerDownRef.current = false;
        }}
        className="fixed inset-0 m-auto h-5/6 max-h-[1000px] w-[calc(100%_-_1rem)] max-w-3xl rounded-2xl bg-white p-0 backdrop:bg-black/50 sm:w-full"
      >
        <div className="relative flex min-h-full flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Back to Edit Club"
                title="Back"
                disabled={isSaving}
                onClick={() => dialogRef.current?.close()}
                className="shrink-0 rounded-full bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-clubPurple"
              >
                <Image src="/assets/icons/cancel.svg" alt="" width={35} height={35} unoptimized />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Create Application</h1>
            </div>
            <button
              ref={newQuestionButtonRef}
              type="button"
              onClick={addQuestion}
              disabled={isSaving || questions.length >= MAX_FORM_QUESTIONS}
              className="inline-flex items-center gap-2 rounded-lg bg-clubPurple px-4 py-2 text-sm font-medium text-white hover:bg-clubBlurple"
            >
              <Plus size={17} aria-hidden="true" />
              New Question
            </button>
          </header>

          <fieldset disabled={isSaving} className="min-w-0 flex-1 space-y-4 p-5 sm:p-6">
            <div className="space-y-3 rounded-xl border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700">
                Application title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={150}
                  aria-invalid={validationAttempt > 0 && Boolean(titleError)}
                  aria-describedby={validationAttempt > 0 && titleError ? "application-title-error" : undefined}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              {validationAttempt > 0 && titleError && (
                <p id="application-title-error" className="text-sm text-red-600">
                  {titleError}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Opens at
                  <input
                    type="datetime-local"
                    value={opensAt}
                    onChange={(event) => setOpensAt(event.target.value)}
                    aria-invalid={validationAttempt > 0 && Boolean(openingError)}
                    aria-describedby={validationAttempt > 0 && openingError ? "application-opening-error" : undefined}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  {validationAttempt > 0 && openingError && (
                    <span id="application-opening-error" className="text-red-600">
                      {openingError}
                    </span>
                  )}
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Closes at
                  <input
                    type="datetime-local"
                    value={closesAt}
                    onChange={(event) => setClosesAt(event.target.value)}
                    aria-invalid={validationAttempt > 0 && Boolean(closingError)}
                    aria-describedby={validationAttempt > 0 && closingError ? "application-closing-error" : undefined}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  {validationAttempt > 0 && closingError && (
                    <span id="application-closing-error" className="text-red-600">
                      {closingError}
                    </span>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-500">Dates use your device’s local time zone.</p>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Questions</h2>
              <span className="text-sm text-gray-500">
                {questions.length} {questions.length === 1 ? "question" : "questions"}
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 px-6 py-14 text-center">
                <ListChecks size={32} className="mb-3 text-clubPurple" aria-hidden="true" />
                <p className="font-medium text-gray-800">No questions yet</p>
                <p className="mt-1 text-sm text-gray-500">Click New Question to start building your application.</p>
              </div>
            ) : (
              <Reorder.Group
                ref={questionListRef}
                axis="y"
                values={questions}
                onReorder={setQuestions}
                className="space-y-4"
              >
                {questions.map((question, index) => (
                  <ApplicationQuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    dragBounds={questionListRef}
                    showAllErrors={validationAttempt > 0}
                    onChange={(updatedQuestion) =>
                      setQuestions((current) =>
                        current.map((entry) => (entry.id === updatedQuestion.id ? updatedQuestion : entry)),
                      )
                    }
                    onRemove={() => setQuestions((current) => current.filter((entry) => entry.id !== question.id))}
                    onKeyboardMove={(direction) => moveQuestion(question.id, direction)}
                  />
                ))}
              </Reorder.Group>
            )}
          </fieldset>
          <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
            <div className="min-w-0 text-sm">
              {saveError && (
                <p role="alert" className="text-red-600">
                  {saveError}
                </p>
              )}
              {validationAttempt > 0 && hasErrors && (
                <p role="alert" className="text-red-600">
                  {questions.length === 0
                    ? "Add a question to continue."
                    : "Complete the highlighted fields to continue."}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-clubPurple px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clubBlurple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clubPurple"
            >
              {isSaving ? "Saving…" : "Save Application"}
            </button>
          </footer>
        </div>
      </motion.dialog>
    </>
  );
}
