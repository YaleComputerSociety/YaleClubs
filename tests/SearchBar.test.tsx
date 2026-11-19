import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "@/components/search/SearchBar";

describe("SearchBar", () => {
  it("expands mobile search, focuses the input, and preserves the query when closed", async () => {
    render(<SearchBar searchQuery="debate" setSearchQuery={jest.fn()} collapsible />);
    fireEvent.click(screen.getByRole("button", { name: "Open search" }));
    expect(screen.getByRole("button", { name: "Close search" })).toHaveAttribute("aria-expanded", "true");
    const input = screen.getByRole("searchbox");
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Open search" })).toHaveFocus();
    expect(input).toHaveValue("debate");
  });

  it("shows a static placeholder and accepts a query", () => {
    const setSearchQuery = jest.fn();
    render(<SearchBar searchQuery="" setSearchQuery={setSearchQuery} />);
    const input = screen.getByPlaceholderText("Search Communities");
    fireEvent.change(input, { target: { value: "debate" } });
    expect(setSearchQuery).toHaveBeenCalledWith("debate");
  });

  it("preserves typed queries and the keyboard shortcut", () => {
    render(<SearchBar searchQuery="yale" setSearchQuery={jest.fn()} />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("yale");
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(input).toHaveFocus();
  });
});
