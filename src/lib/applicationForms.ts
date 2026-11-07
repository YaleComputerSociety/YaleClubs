export type FormQuestion =
  | { id: string; type: "short-answer"; prompt: string; wordLimit: number }
  | { id: string; type: "multiple-choice"; prompt: string; options: { id: string; text: string }[] };

export type ApplicationFormInput = {
  clubId: string;
  title: string;
  opensAt: Date;
  closesAt: Date;
  questions: FormQuestion[];
};

export const MAX_FORM_QUESTIONS = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

// Accept only the fields used by the selected question type. Never trust client validation.
export function parseApplicationForm(
  body: unknown,
): { data: ApplicationFormInput; error?: never } | { data?: never; error: string } {
  if (!isRecord(body)) return { error: "Expected an application form." };
  if (typeof body.clubId !== "string" || !/^[a-f\d]{24}$/i.test(body.clubId)) {
    return { error: "A valid club ID is required." };
  }
  if (!isText(body.title, 150)) return { error: "Enter a title of up to 150 characters." };
  const parseDate = (value: unknown): Date | null => {
    if (typeof value !== "string" || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const opensAt = parseDate(body.opensAt);
  const closesAt = parseDate(body.closesAt);
  if (!opensAt || !closesAt || closesAt <= opensAt) {
    return { error: "Enter opening and closing dates, with closing after opening." };
  }
  if (!Array.isArray(body.questions) || body.questions.length < 1 || body.questions.length > MAX_FORM_QUESTIONS) {
    return { error: `Add between 1 and ${MAX_FORM_QUESTIONS} questions.` };
  }
  const questions: FormQuestion[] = [];
  const questionIds = new Set<string>();
  for (const question of body.questions) {
    if (!isRecord(question) || !isText(question.id, 100) || questionIds.has(question.id)) {
      return { error: "Each question must have a unique ID." };
    }
    questionIds.add(question.id);
    if (!isText(question.prompt, 2000)) return { error: "Each question needs a prompt of up to 2,000 characters." };
    const base = { id: question.id, prompt: question.prompt.trim() };
    if (question.type === "short-answer") {
      if (
        typeof question.wordLimit !== "number" ||
        !Number.isInteger(question.wordLimit) ||
        question.wordLimit < 1 ||
        question.wordLimit > 5000
      ) {
        return { error: "Short-answer word limits must be whole numbers from 1 to 5,000." };
      }
      questions.push({ ...base, type: "short-answer", wordLimit: question.wordLimit });
    } else if (question.type === "multiple-choice") {
      if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 10) {
        return { error: "Multiple-choice questions need 2 to 10 choices." };
      }
      const optionIds = new Set<string>();
      const options: { id: string; text: string }[] = [];
      for (const option of question.options) {
        if (!isRecord(option) || !isText(option.id, 100) || optionIds.has(option.id) || !isText(option.text, 2000)) {
          return { error: "Each choice needs a unique ID and text of up to 2,000 characters." };
        }
        optionIds.add(option.id);
        options.push({ id: option.id, text: option.text.trim() });
      }
      questions.push({ ...base, type: "multiple-choice", options });
    } else {
      return { error: "Unsupported question type." };
    }
  }
  return { data: { clubId: body.clubId, title: body.title.trim(), opensAt, closesAt, questions } };
}
