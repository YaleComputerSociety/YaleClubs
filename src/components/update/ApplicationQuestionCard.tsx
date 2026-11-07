"use client";

import { RefObject, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Reorder, useDragControls, useReducedMotion } from "framer-motion";
import { GripVertical, Trash2 } from "lucide-react";
import { ApplicationQuestion, validateApplicationQuestion } from "./applicationQuestions";
import ApplicationQuestionFields from "./ApplicationQuestionFields";

type ApplicationQuestionCardProps = {
  question: ApplicationQuestion;
  index: number;
  dragBounds: RefObject<HTMLUListElement>;
  showAllErrors: boolean;
  onChange: (question: ApplicationQuestion) => void;
  onRemove: () => void;
  onKeyboardMove: (direction: -1 | 1) => void;
};

export default function ApplicationQuestionCard({
  question,
  index,
  dragBounds,
  showAllErrors,
  onChange,
  onRemove,
  onKeyboardMove,
}: ApplicationQuestionCardProps) {
  const dragControls = useDragControls();
  const cardRef = useRef<HTMLLIElement>(null);
  const [dragLimits, setDragLimits] = useState({ top: 0, bottom: 0 });
  const reduceMotion = useReducedMotion();
  const hasErrors = showAllErrors && Object.keys(validateApplicationQuestion(question)).length > 0;

  return (
    <Reorder.Item
      ref={cardRef}
      value={question}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={dragLimits}
      dragElastic={0}
      dragMomentum={false}
      layout="position"
      transition={{ layout: { duration: reduceMotion ? 0 : 0.2 } }}
      whileDrag={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)" }}
      className={`relative scroll-my-4 space-y-3 rounded-xl border bg-white p-4 ${
        hasErrors ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Question {index + 1}</h3>
          <select
            aria-label="Question type"
            value={question.type}
            onChange={(event) => onChange({ ...question, type: event.target.value as ApplicationQuestion["type"] })}
            className="rounded-lg border border-purple-100 bg-purple-50 px-2 py-1.5 text-xs font-medium text-clubPurple focus:border-clubPurple focus:outline-none focus:ring-1 focus:ring-clubPurple"
          >
            <option value="short-answer">Short answer</option>
            <option value="multiple-choice">Multiple choice</option>
          </select>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Drag question ${index + 1} to reorder`}
            aria-keyshortcuts="ArrowUp ArrowDown"
            title="Drag to reorder, or use the up and down arrow keys"
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0) return;
              const card = cardRef.current?.getBoundingClientRect();
              const list = dragBounds.current?.getBoundingClientRect();
              if (!card || !list) return;
              event.currentTarget.focus({ preventScroll: true });
              // Measure once per gesture. Ref constraints also react to field
              // resizing and can move cards while someone is editing them.
              flushSync(() =>
                setDragLimits({
                  top: Math.min(0, list.top - card.top),
                  bottom: Math.max(0, list.bottom - card.bottom),
                }),
              );
              dragControls.start(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                onKeyboardMove(event.key === "ArrowUp" ? -1 : 1);
              }
            }}
            className="inline-flex touch-none cursor-grab select-none items-center gap-1 rounded-lg p-2 text-sm text-gray-500 hover:bg-purple-50 hover:text-clubPurple active:cursor-grabbing"
          >
            <GripVertical size={16} aria-hidden="true" />
            Drag
          </button>
          <button
            type="button"
            aria-label={`Remove question ${index + 1}`}
            onClick={onRemove}
            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ApplicationQuestionFields question={question} onChange={onChange} showAllErrors={showAllErrors} />
    </Reorder.Item>
  );
}
