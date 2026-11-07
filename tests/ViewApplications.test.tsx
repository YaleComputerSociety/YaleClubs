import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import ViewApplicationsModal from "@/components/update/ViewApplicationsModal";

const originalFetch = global.fetch;

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
});

beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  global.fetch = originalFetch;
});

function form(id = "form1") {
  return {
    _id: id,
    title: "Fall Application",
    opensAt: "2026-09-01T14:00:00Z",
    closesAt: "2026-09-20T22:00:00Z",
    questions: [
      { id: "q1", type: "short-answer", prompt: "Why join?", wordLimit: 250 },
      {
        id: "q2",
        type: "multiple-choice",
        prompt: "Which team?",
        options: [
          { id: "a", text: "Events" },
          { id: "b", text: "Outreach" },
        ],
      },
    ],
  };
}

function respond(forms: unknown[] = [], nextCursor: string | null = null) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ forms, nextCursor }) });
}

function renderViewer() {
  const onClose = jest.fn();
  const onCreate = jest.fn();
  render(<ViewApplicationsModal clubId="club1" clubName="Chess Club" onClose={onClose} onCreate={onCreate} />);
  return { onClose, onCreate };
}

it("shows saved forms with their dates and an expandable question preview", async () => {
  respond([form()]);
  const { onClose } = renderViewer();
  expect(screen.getByRole("status")).toHaveTextContent("Loading applications");
  await screen.findByRole("heading", { name: "Fall Application" });
  expect(screen.getByText("Chess Club")).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/application-forms?clubId=club1",
    expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
  );
  const preview = screen.getByText("View 2 questions");
  fireEvent.click(preview);
  expect(preview.closest("details")).toHaveAttribute("open");
  expect(screen.getByText("Why join?")).toBeVisible();
  expect(screen.getByText("250 word limit")).toBeVisible();
  expect(screen.getByText("Events")).toBeVisible();
  expect(screen.getByText("Outreach")).toBeVisible();
  expect(screen.getByRole("article").querySelectorAll("time")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Close applications" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("shows an empty state and offers to create an application", async () => {
  respond();
  const { onCreate } = renderViewer();
  await screen.findByText("No applications yet");
  fireEvent.click(screen.getByRole("button", { name: "Create Application" }));
  expect(onCreate).toHaveBeenCalledTimes(1);
});

it("shows a failed request and lets the leader retry", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Unable to load applications" }),
  });
  respond([form()]);
  renderViewer();
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load applications");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("heading", { name: "Fall Application" });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("loads additional forms without losing the first page", async () => {
  respond([form()], "cursor1");
  respond([{ ...form("form2"), title: "Spring Application" }]);
  renderViewer();
  fireEvent.click(await screen.findByRole("button", { name: "Load more applications" }));
  await screen.findByRole("heading", { name: "Spring Application" });
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(within(screen.getAllByRole("article")[0]).getByRole("heading")).toHaveTextContent("Fall Application");
  expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe("/api/application-forms?clubId=club1&before=cursor1");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Load more applications" })).not.toBeInTheDocument());
});

it("requires confirmation, allows cancellation and removes a successfully deleted form", async () => {
  respond([form()]);
  renderViewer();
  const trigger = await screen.findByRole("button", { name: "Delete Fall Application" });
  fireEvent.click(trigger);
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("button", { name: "Confirm delete" })).not.toBeInTheDocument();
  fireEvent.click(trigger);
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ deletedId: "form1" }) });
  fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
  await screen.findByText("No applications yet");
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("deleted");
  expect(global.fetch).toHaveBeenLastCalledWith("/api/application-forms?clubId=club1&formId=form1", {
    method: "DELETE",
  });
});

it("preserves the form after a failed deletion and allows a retry", async () => {
  respond([form()]);
  renderViewer();
  fireEvent.click(await screen.findByRole("button", { name: "Delete Fall Application" }));
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Unable to delete" }) });
  fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to delete");
  expect(screen.getByRole("heading", { name: "Fall Application" })).toBeInTheDocument();
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ deletedId: "form1" }) });
  fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
  await screen.findByText("No applications yet");
});

it("disables repeated deletion while a request is pending", async () => {
  respond([form()]);
  renderViewer();
  fireEvent.click(await screen.findByRole("button", { name: "Delete Fall Application" }));
  let finish!: (value: unknown) => void;
  (global.fetch as jest.Mock).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
  expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Deleting…" }));
  expect(global.fetch).toHaveBeenCalledTimes(2);
  finish({ ok: true, json: async () => ({ deletedId: "form1" }) });
  await screen.findByText("No applications yet");
});
