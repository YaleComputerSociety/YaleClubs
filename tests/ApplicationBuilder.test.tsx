import { fireEvent, render, screen, within } from "@testing-library/react";
import CreateApplicationModal from "@/components/update/CreateApplicationModal";

jest.mock(
  "next/image",
  () =>
    function MockImage({ alt, src }: { alt: string; src: string }) {
      // This mock intentionally uses a native image instead of Next.js image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      return <img alt={alt} src={src} />;
    },
);

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    },
  });
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: jest.fn(),
  });
});

function addQuestion() {
  fireEvent.click(screen.getByRole("button", { name: "New Question" }));
}

it("adds questions directly to the application and edits their prompts inline", () => {
  render(<CreateApplicationModal onClose={jest.fn()} />);
  addQuestion();
  const prompt = screen.getByRole("textbox", { name: "Question prompt" });
  fireEvent.change(prompt, { target: { value: "Why would you like to join?" } });
  addQuestion();

  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getAllByRole("textbox", { name: "Question prompt" })).toHaveLength(2);
  expect(screen.getAllByRole("textbox", { name: "Question prompt" })[0]).toHaveValue("Why would you like to join?");
  expect(screen.queryByRole("button", { name: "Edit question 1" })).not.toBeInTheDocument();
});

it("preserves both question types' settings and enforces the ten-choice limit", () => {
  render(<CreateApplicationModal onClose={jest.fn()} />);
  addQuestion();
  const type = screen.getByRole("combobox", { name: "Question type" });
  fireEvent.change(screen.getByRole("textbox", { name: "Word limit" }), { target: { value: "150" } });
  fireEvent.change(type, { target: { value: "multiple-choice" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Answer choice 1" }), { target: { value: "Arts" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Answer choice 2" }), { target: { value: "Science" } });
  for (let i = 0; i < 8; i++) fireEvent.click(screen.getByRole("button", { name: "Add Choice" }));
  expect(screen.getAllByRole("textbox", { name: /^Answer choice/ })).toHaveLength(10);
  expect(screen.getByRole("button", { name: "Add Choice" })).toBeDisabled();

  fireEvent.change(type, { target: { value: "short-answer" } });
  expect(screen.getByRole("textbox", { name: "Word limit" })).toHaveValue("150");
  fireEvent.change(type, { target: { value: "multiple-choice" } });
  expect(screen.getByRole("textbox", { name: "Answer choice 1" })).toHaveValue("Arts");
  expect(screen.getByRole("textbox", { name: "Answer choice 2" })).toHaveValue("Science");
  fireEvent.click(screen.getByRole("button", { name: "Remove answer choice 3" }));
  expect(screen.getByRole("button", { name: "Add Choice" })).toBeEnabled();
});

it("validates inline fields on blur and clears errors as the input is corrected", () => {
  render(<CreateApplicationModal onClose={jest.fn()} />);
  addQuestion();
  const wordLimit = screen.getByRole("textbox", { name: "Word limit" });
  fireEvent.change(wordLimit, { target: { value: "-1" } });
  fireEvent.blur(wordLimit);
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole number from 1 to 5,000.");
  fireEvent.change(wordLimit, { target: { value: "500" } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("keeps inline question contents with their cards when reordered", () => {
  render(<CreateApplicationModal onClose={jest.fn()} />);
  addQuestion();
  fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), { target: { value: "First prompt" } });
  addQuestion();
  fireEvent.change(screen.getAllByRole("textbox", { name: "Question prompt" })[1], {
    target: { value: "Second prompt" },
  });
  fireEvent.keyDown(screen.getByRole("button", { name: "Drag question 2 to reorder" }), { key: "ArrowUp" });

  const cards = screen.getAllByRole("listitem");
  expect(within(cards[0]).getByRole("textbox", { name: "Question prompt" })).toHaveValue("Second prompt");
  expect(within(cards[1]).getByRole("textbox", { name: "Question prompt" })).toHaveValue("First prompt");
});

it("requires a question before continuing and focuses New Question", () => {
  const onClose = jest.fn();
  render(<CreateApplicationModal onClose={onClose} />);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Add a question to continue.");
  expect(screen.getByRole("button", { name: "New Question" })).toHaveFocus();
  expect(onClose).not.toHaveBeenCalled();
});

it("reveals errors in every question and takes repeated Next attempts to the first remaining error", () => {
  const onClose = jest.fn();
  render(<CreateApplicationModal onClose={onClose} />);
  addQuestion();
  addQuestion();
  const prompts = screen.getAllByRole("textbox", { name: "Question prompt" });

  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getAllByText("Enter a question prompt.")).toHaveLength(2);
  expect(prompts[0]).toHaveFocus();
  expect(prompts[0].scrollIntoView).toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.change(prompts[0], { target: { value: "First question" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(prompts[1]).toHaveFocus();
  expect(onClose).not.toHaveBeenCalled();
});

it.each(["", "0", "5001", "1.5"])("blocks Next for invalid word limit %s until corrected", (value) => {
  const onClose = jest.fn();
  render(<CreateApplicationModal onClose={onClose} />);
  addQuestion();
  fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), {
    target: { value: "Tell us about yourself" },
  });
  const wordLimit = screen.getByRole("textbox", { name: "Word limit" });
  fireEvent.change(wordLimit, { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(wordLimit).toHaveFocus();
  expect(wordLimit).toHaveAttribute("aria-invalid", "true");
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.change(wordLimit, { target: { value: "5000" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("requires all multiple-choice answers and closes without a save request once everything is complete", () => {
  const onClose = jest.fn();
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();
  global.fetch = mockFetch;
  try {
    render(<CreateApplicationModal onClose={onClose} />);
    addQuestion();
    fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), {
      target: { value: "Which activity?" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Question type" }), { target: { value: "multiple-choice" } });
    const firstChoice = screen.getByRole("textbox", { name: "Answer choice 1" });
    const secondChoice = screen.getByRole("textbox", { name: "Answer choice 2" });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(firstChoice).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.change(firstChoice, { target: { value: "Arts" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(secondChoice).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.change(secondChoice, { target: { value: "Science" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockFetch).not.toHaveBeenCalled();
  } finally {
    global.fetch = originalFetch;
  }
});
