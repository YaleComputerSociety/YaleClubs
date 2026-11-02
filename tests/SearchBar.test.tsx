import { act, render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/search/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: false }),
    });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("rotates suggestions while idle, pauses on focus, and accepts a query", () => {
    const setSearchQuery = jest.fn();
    render(<SearchBar searchQuery="" setSearchQuery={setSearchQuery} />);
    const input = screen.getByRole("searchbox", { name: "Search communities" });
    expect(screen.getByText("Search Communities")).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(3500);
    });
    expect(screen.getByText("Try Yale Club Swim")).toBeInTheDocument();
    fireEvent.focus(input);
    expect(screen.queryByText("Try Yale Club Swim")).not.toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(7000);
    });
    fireEvent.change(input, { target: { value: "debate" } });
    expect(setSearchQuery).toHaveBeenCalledWith("debate");
    fireEvent.blur(input);
    expect(screen.getByText("Try Yale Club Swim")).toBeInTheDocument();
  });

  it("does not animate suggestions when reduced motion is requested", () => {
    jest.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<SearchBar searchQuery="" setSearchQuery={jest.fn()} />);
    act(() => {
      jest.advanceTimersByTime(10500);
    });
    expect(screen.getByText("Search Communities")).toBeInTheDocument();
  });

  it("preserves typed queries and the keyboard shortcut", () => {
    render(<SearchBar searchQuery="yale" setSearchQuery={jest.fn()} />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("yale");
    expect(screen.queryByText("Try Yale Club Swim")).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(input).toHaveFocus();
  });
});
