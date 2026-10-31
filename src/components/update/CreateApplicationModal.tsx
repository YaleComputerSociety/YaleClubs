"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ListChecks, Plus } from "lucide-react";
import { motion, Reorder, useReducedMotion } from "framer-motion";
import { ApplicationQuestion, createApplicationQuestion, validateApplicationQuestion } from "./applicationQuestions";
import ApplicationQuestionCard from "./ApplicationQuestionCard";

type CreateApplicationModalProps = {
  onClose: () => void;
};

export default function CreateApplicationModal({ onClose }: CreateApplicationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const questionListRef = useRef<HTMLUListElement>(null);
  const newQuestionButtonRef = useRef<HTMLButtonElement>(null);
  const backdropPointerDownRef = useRef(false);
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const reduceMotion = useReducedMotion();
  const hasErrors =
    questions.length === 0 ||
    questions.some((question) => Object.keys(validateApplicationQuestion(question)).length > 0);

  const handleNext = () => {
    if (hasErrors) {
      setValidationAttempt((current) => current + 1);
      return;
    }
    dialogRef.current?.close();
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

  useEffect(() => {
    if (!draggingQuestionId) return;
    const finishDrag = () => setDraggingQuestionId(null);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    return () => {
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [draggingQuestionId]);

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
        onPointerDown={(event) => {
          backdropPointerDownRef.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (backdropPointerDownRef.current && event.target === event.currentTarget) event.currentTarget.close();
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
              className="inline-flex items-center gap-2 rounded-lg bg-clubPurple px-4 py-2 text-sm font-medium text-white hover:bg-clubBlurple"
            >
              <Plus size={17} aria-hidden="true" />
              New Question
            </button>
          </header>

          <div className="flex-1 space-y-4 p-5 sm:p-6">
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
                values={questions.map((question) => question.id)}
                onReorder={(ids) => {
                  const positions = new Map(ids.map((id, index) => [id, index]));
                  setQuestions((current) =>
                    [...current].sort(
                      (a, b) => (positions.get(a.id) ?? current.length) - (positions.get(b.id) ?? current.length),
                    ),
                  );
                }}
                className="space-y-4"
              >
                {questions.map((question, index) => (
                  <ApplicationQuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    dragBounds={questionListRef}
                    dragEnabled={draggingQuestionId === question.id}
                    animateReorder={draggingQuestionId !== null}
                    onDragStateChange={(active) => setDraggingQuestionId(active ? question.id : null)}
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
          </div>
          <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
            <div className="min-w-0 text-sm">
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
              onClick={handleNext}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-clubPurple px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clubBlurple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clubPurple"
            >
              Next
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </footer>
        </div>
      </motion.dialog>
    </>
  );
}
