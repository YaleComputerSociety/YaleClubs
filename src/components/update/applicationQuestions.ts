export type ApplicationQuestion = {
  id: string;
  type: "short-answer" | "multiple-choice";
  prompt: string;
  wordLimit: string;
  options: { id: string; text: string }[];
};

export const MAX_QUESTION_TEXT_LENGTH = 2000;
export const MAX_QUESTION_WORD_LIMIT = 5000;
export const MAX_ANSWER_CHOICES = 10;

export function validateApplicationQuestion(question: ApplicationQuestion): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!question.prompt.trim()) {
    errors.prompt = "Enter a question prompt.";
  } else if (question.prompt.length > MAX_QUESTION_TEXT_LENGTH) {
    errors.prompt = "Keep your question prompt within 2,000 characters.";
  }

  if (question.type === "short-answer") {
    const value = question.wordLimit.trim();
    const limit = Number(value);
    if (!value) {
      errors.wordLimit = "Enter a word limit.";
    } else if (!/^\d+$/.test(value) || !Number.isSafeInteger(limit) || limit < 1 || limit > MAX_QUESTION_WORD_LIMIT) {
      errors.wordLimit = "Enter a whole number from 1 to 5,000.";
    }
  } else {
    if (question.options.length < 2) errors.choices = "Fill in each choice.";
    if (question.options.length > MAX_ANSWER_CHOICES) errors.choices = "Use no more than 10 choices.";
    for (const option of question.options) {
      if (!option.text.trim()) {
        errors[option.id] = "Fill in each choice.";
      } else if (option.text.length > MAX_QUESTION_TEXT_LENGTH) {
        errors[option.id] = "Keep each choice within 2,000 characters.";
      }
    }
  }
  return errors;
}

export function createApplicationQuestion(): ApplicationQuestion {
  return {
    id: crypto.randomUUID(),
    type: "short-answer",
    prompt: "",
    wordLimit: "250",
    options: [
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" },
    ],
  };
}
