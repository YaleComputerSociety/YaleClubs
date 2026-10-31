"use client";

import { RefObject, useRef, useState } from "react";
import { Reorder, useDragControls, useReducedMotion } from "framer-motion";
import { GripVertical, Trash2 } from "lucide-react";
import { ApplicationQuestion, validateApplicationQuestion } from "./applicationQuestions";
import ApplicationQuestionFields from "./ApplicationQuestionFields";

type ApplicationQuestionCardProps = {
  question: ApplicationQuestion;
  index: number;
  dragBounds: RefObject<HTMLUListElement>;
  dragEnabled: boolean;
  animateReorder: boolean;
  onDragStateChange: (active: boolean) => void;
  showAllErrors: boolean;
  onChange: (question: ApplicationQuestion) => void;
  onRemove: () => void;
  onKeyboardMove: (direction: -1 | 1) => void;
};

const MAX_EDGE_STRETCH = 24;
const EDGE_DRAG_DISTANCE = 160;

// The top of the list is a firm boundary; only the bottom allows a resisted stretch.
function resistAtEdge(offset: number, top: number, bottom: number): number {
  if (offset < top) return top;
  if (offset <= bottom) return offset;
  const progress = Math.min((offset - bottom) / EDGE_DRAG_DISTANCE, 1);
  return bottom + MAX_EDGE_STRETCH * (1 - (1 - progress) ** 3);
}

export default function ApplicationQuestionCard({
  question,
  index,
  dragBounds,
  dragEnabled,
  animateReorder,
  onDragStateChange,
  showAllErrors,
  onChange,
  onRemove,
  onKeyboardMove,
}: ApplicationQuestionCardProps) {
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const edgeBounds = useRef({ top: 0, bottom: 0 });
  const hasErrors = showAllErrors && Object.keys(validateApplicationQuestion(question)).length > 0;

  return (
    <Reorder.Item
      value={question.id}
      dragControls={dragControls}
      dragListener={false}
      // Ref constraints track resize events; enable them only during a drag so
      // editing a question cannot move an otherwise stationary card.
      dragConstraints={dragEnabled ? dragBounds : false}
      dragElastic={0}
      dragMomentum={false}
      onMeasureDragConstraints={(bounds) => {
        edgeBounds.current = { top: bounds.top, bottom: bounds.bottom };
        return { ...bounds, bottom: bounds.bottom + EDGE_DRAG_DISTANCE };
      }}
      transformTemplate={(values, generatedTransform) => {
        if (typeof values.y !== "number") return generatedTransform;
        const { top, bottom } = edgeBounds.current;
        const correction = resistAtEdge(values.y, top, bottom) - values.y;
        if (!correction) return generatedTransform;
        return `${generatedTransform === "none" ? "" : generatedTransform} translateY(${correction}px)`;
      }}
      layout="position"
      transition={{ layout: { duration: !reduceMotion && animateReorder ? 0.2 : 0 } }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        onDragStateChange(false);
      }}
      className={`relative scroll-my-4 space-y-3 rounded-xl border bg-white p-4 ${
        isDragging
          ? "border-clubPurple shadow-lg ring-2 ring-purple-100"
          : hasErrors
            ? "border-red-300"
            : "border-gray-200"
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
              event.currentTarget.focus({ preventScroll: true });
              onDragStateChange(true);
              dragControls.start(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                onKeyboardMove(event.key === "ArrowUp" ? -1 : 1);
              }
            }}
            className="inline-flex touch-none select-none items-center gap-1 rounded-lg p-2 text-sm text-gray-500 hover:bg-purple-50 hover:text-clubPurple active:cursor-grabbing"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
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
