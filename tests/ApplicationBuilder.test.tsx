import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

const originalFetch = global.fetch;
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "form1", title: "Fall Application" }),
  });
});
afterEach(() => {
  global.fetch = originalFetch;
});

function renderBuilder(onClose = jest.fn()) {
  render(<CreateApplicationModal clubId="507f1f77bcf86cd799439011" onClose={onClose} />);
  fireEvent.change(screen.getByRole("textbox", { name: "Application title" }), {
    target: { value: "Fall Application" },
  });
  fireEvent.change(screen.getByLabelText("Opens at"), { target: { value: "2026-11-10T09:00" } });
  fireEvent.change(screen.getByLabelText("Closes at"), { target: { value: "2026-11-20T17:00" } });
}

function addQuestion() {
  fireEvent.click(screen.getByRole("button", { name: "New Question" }));
}

it("adds questions directly to the application and edits their prompts inline", () => {
  renderBuilder();
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
  renderBuilder();
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
  renderBuilder();
  addQuestion();
  const wordLimit = screen.getByRole("textbox", { name: "Word limit" });
  fireEvent.change(wordLimit, { target: { value: "-1" } });
  fireEvent.blur(wordLimit);
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole number from 1 to 5,000.");
  fireEvent.change(wordLimit, { target: { value: "500" } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("keeps inline question contents with their cards when reordered", () => {
  renderBuilder();
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
  renderBuilder(onClose);
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Add a question to continue.");
  expect(screen.getByRole("button", { name: "New Question" })).toHaveFocus();
  expect(onClose).not.toHaveBeenCalled();
});

it("reveals errors in every question and takes repeated Next attempts to the first remaining error", () => {
  const onClose = jest.fn();
  renderBuilder(onClose);
  addQuestion();
  addQuestion();
  const prompts = screen.getAllByRole("textbox", { name: "Question prompt" });

  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  expect(screen.getAllByText("Enter a question prompt.")).toHaveLength(2);
  expect(prompts[0]).toHaveFocus();
  expect(prompts[0].scrollIntoView).toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.change(prompts[0], { target: { value: "First question" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  expect(prompts[1]).toHaveFocus();
  expect(onClose).not.toHaveBeenCalled();
});

it.each(["", "0", "5001", "1.5"])("blocks saving for invalid word limit %s until corrected", async (value) => {
  const onClose = jest.fn();
  renderBuilder(onClose);
  addQuestion();
  fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), {
    target: { value: "Tell us about yourself" },
  });
  const wordLimit = screen.getByRole("textbox", { name: "Word limit" });
  fireEvent.change(wordLimit, { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  expect(wordLimit).toHaveFocus();
  expect(wordLimit).toHaveAttribute("aria-invalid", "true");
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.change(wordLimit, { target: { value: "5000" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

it("saves multiple-choice questions only after every choice is complete", async () => {
  const onClose = jest.fn();
  const originalFetch = global.fetch;
  const mockFetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ id: "form1", title: "Fall Application" }) });
  global.fetch = mockFetch;
  try {
    renderBuilder(onClose);
    addQuestion();
    fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), {
      target: { value: "Which activity?" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Question type" }), { target: { value: "multiple-choice" } });
    const firstChoice = screen.getByRole("textbox", { name: "Answer choice 1" });
    const secondChoice = screen.getByRole("textbox", { name: "Answer choice 2" });

    fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
    expect(firstChoice).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.change(firstChoice, { target: { value: "Arts" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
    expect(secondChoice).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.change(secondChoice, { target: { value: "Science" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(payload.questions[0]).toMatchObject({
      type: "multiple-choice",
      options: [
        { id: expect.any(String), text: "Arts" },
        { id: expect.any(String), text: "Science" },
      ],
    });
    expect(payload.questions[0]).not.toHaveProperty("wordLimit");
  } finally {
    global.fetch = originalFetch;
  }
});

it("keeps the form open and preserves answers when the save request fails", async () => {
  const onClose = jest.fn();
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Unable to save" }) });
  renderBuilder(onClose);
  addQuestion();
  fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), { target: { value: "Why join?" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  await screen.findByText("Unable to save");
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox", { name: "Question prompt" })).toHaveValue("Why join?");
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  const payload = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body);
  expect(payload).toMatchObject({ clubId: "507f1f77bcf86cd799439011", title: "Fall Application" });
  expect(payload.questions[0]).toMatchObject({ type: "short-answer", wordLimit: 250 });
  expect(payload.questions[0]).not.toHaveProperty("options");
  expect(new Date(payload.opensAt)).toEqual(new Date("2026-11-10T09:00"));
});

it("rejects a closing date before the opening date", () => {
  renderBuilder();
  addQuestion();
  fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), { target: { value: "Why join?" } });
  fireEvent.change(screen.getByLabelText("Closes at"), { target: { value: "2026-11-09T09:00" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  expect(screen.getByText("Closing must be after opening.")).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

it("prevents duplicate requests while a save is pending", async () => {
  let finishSave!: (value: unknown) => void;
  (global.fetch as jest.Mock).mockReturnValue(
    new Promise((resolve) => {
      finishSave = resolve;
    }),
  );
  const onClose = jest.fn();
  renderBuilder(onClose);
  addQuestion();
  fireEvent.change(screen.getByRole("textbox", { name: "Question prompt" }), { target: { value: "Why join?" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Application" }));
  expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Saving…" }));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  finishSave({ ok: true, json: async () => ({ id: "form1", title: "Fall Application" }) });
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});
