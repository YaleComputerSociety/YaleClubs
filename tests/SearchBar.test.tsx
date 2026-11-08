import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/search/SearchBar";

describe("SearchBar", () => {
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
