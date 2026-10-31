"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  ApplicationQuestion,
  MAX_ANSWER_CHOICES,
  MAX_QUESTION_TEXT_LENGTH,
  validateApplicationQuestion,
} from "./applicationQuestions";

type ApplicationQuestionFieldsProps = {
  question: ApplicationQuestion;
  onChange: (question: ApplicationQuestion) => void;
  showAllErrors: boolean;
};

const inputStyle =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-clubPurple focus:outline-none focus:ring-1 focus:ring-clubPurple";
const textAreaStyle = `${inputStyle} block w-full min-h-[3rem] resize-y`;

export default function ApplicationQuestionFields({
  question,
  onChange,
  showAllErrors,
}: ApplicationQuestionFieldsProps) {
  const fieldId = useId();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((current) => ({ ...current, [field]: true }));

  const errors = validateApplicationQuestion(question);
  const showPromptError = Boolean((showAllErrors || touched.prompt) && errors.prompt);
  const showLimitError = Boolean((showAllErrors || touched.wordLimit) && errors.wordLimit);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <label htmlFor={`${fieldId}-prompt`} className="block text-sm font-medium text-gray-700">
          Question prompt
        </label>
        <textarea
          id={`${fieldId}-prompt`}
          autoFocus
          required
          maxLength={MAX_QUESTION_TEXT_LENGTH}
          aria-invalid={showPromptError}
          aria-describedby={`${fieldId}-prompt-count${showPromptError ? ` ${fieldId}-prompt-error` : ""}`}
          value={question.prompt}
          onChange={(event) => onChange({ ...question, prompt: event.target.value })}
          onBlur={() => markTouched("prompt")}
          placeholder={
            question.type === "short-answer" ? "What is your favorite hobby?" : "Which of the following describes you?"
          }
          rows={2}
          className={textAreaStyle}
        />
        <p id={`${fieldId}-prompt-count`} className="text-right text-xs text-gray-500">
          {question.prompt.length.toLocaleString("en-US")} / 2,000 characters
        </p>
        {showPromptError && (
          <p id={`${fieldId}-prompt-error`} role="alert" className="text-sm text-red-600">
            {errors.prompt}
          </p>
        )}
      </div>

      {question.type === "short-answer" ? (
        <div className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <label htmlFor={`${fieldId}-limit`} className="mr-auto text-sm font-medium text-gray-700">
              Word limit
            </label>
            <input
              id={`${fieldId}-limit`}
              type="text"
              inputMode="numeric"
              required
              aria-invalid={showLimitError}
              aria-describedby={`${fieldId}-limit-help${showLimitError ? ` ${fieldId}-limit-error` : ""}`}
              value={question.wordLimit}
              onChange={(event) => onChange({ ...question, wordLimit: event.target.value })}
              onBlur={() => markTouched("wordLimit")}
              className={`${inputStyle} w-24`}
            />
            <p id={`${fieldId}-limit-help`} className="text-xs text-gray-500">
              Max 5,000 words
            </p>
          </div>
          {showLimitError && (
            <p id={`${fieldId}-limit-error`} role="alert" className="text-sm text-red-600">
              {errors.wordLimit}
            </p>
          )}
        </div>
      ) : (
        <div
          className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
          role="group"
          aria-label="Answer choices"
        >
          <h4 className="text-sm font-medium text-gray-700">Answer choices</h4>
          {question.options.map((option, index) => {
            const choiceError = errors[option.id];
            const showChoiceError = Boolean((showAllErrors || touched[option.id]) && choiceError);
            return (
              <div key={option.id} className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <textarea
                    aria-label={`Answer choice ${index + 1}`}
                    required
                    rows={1}
                    maxLength={MAX_QUESTION_TEXT_LENGTH}
                    aria-invalid={showChoiceError}
                    aria-describedby={`${fieldId}-choice-${option.id}-count${showChoiceError ? ` ${fieldId}-choice-${option.id}-error` : ""}`}
                    value={option.text}
                    onChange={(event) =>
                      onChange({
                        ...question,
                        options: question.options.map((entry) =>
                          entry.id === option.id ? { ...entry, text: event.target.value } : entry,
                        ),
                      })
                    }
                    onBlur={() => markTouched(option.id)}
                    placeholder={`Choice ${index + 1}`}
                    className={`${inputStyle} block w-full min-h-[2.5rem] resize-y`}
                  />
                  <p id={`${fieldId}-choice-${option.id}-count`} className="text-right text-xs text-gray-500">
                    {option.text.length.toLocaleString("en-US")} / 2,000 characters
                  </p>
                  {showChoiceError && (
                    <p id={`${fieldId}-choice-${option.id}-error`} role="alert" className="text-sm text-red-600">
                      {choiceError}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove answer choice ${index + 1}`}
                  disabled={question.options.length <= 2}
                  onClick={() =>
                    onChange({ ...question, options: question.options.filter((entry) => entry.id !== option.id) })
                  }
                  className="rounded-lg p-2 text-gray-500 enabled:hover:bg-red-50 enabled:hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            );
          })}
          {showAllErrors && errors.choices && (
            <p id={`${fieldId}-choices-error`} role="alert" className="text-sm text-red-600">
              {errors.choices}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              data-invalid={showAllErrors && errors.choices ? "true" : undefined}
              aria-describedby={showAllErrors && errors.choices ? `${fieldId}-choices-error` : undefined}
              disabled={question.options.length >= MAX_ANSWER_CHOICES}
              onClick={() => {
                if (question.options.length >= MAX_ANSWER_CHOICES) return;
                onChange({ ...question, options: [...question.options, { id: crypto.randomUUID(), text: "" }] });
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-clubPurple hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} aria-hidden="true" />
              Add Choice
            </button>
            <p className="text-xs text-gray-500">Max 10 Choices</p>
          </div>
        </div>
      )}
    </div>
  );
}
